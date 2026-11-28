// Finds new (2026+) primary-health-care research about Pakistan via the free Europe PMC API.
const EPMC = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search';

const TOPICS = [
  '"primary health care"', '"primary healthcare"', '"basic health unit"', '"lady health worker"', '"community health worker"',
  'maternal', 'newborn', 'neonatal', 'antenatal', '"skilled birth"', 'immunization', 'immunisation', 'vaccination', '"zero-dose"',
  'stunting', 'wasting', 'malnutrition', 'nutrition', '"family planning"', 'contraceptive', '"health information system"', 'DHIS2',
  '"health facility"', '"universal health coverage"', '"essential package of health services"',
];

export async function findCandidates({ fromDate = '2026-01-01', used = [], max = 25 } = {}) {
  const topic = TOPICS.map(t => `ABSTRACT:${t}`).join(' OR ');
  const query = `(TITLE:"Pakistan" OR ABSTRACT:"Pakistan") AND (${topic}) AND FIRST_PDATE:[${fromDate} TO 2100-12-31] AND HAS_ABSTRACT:y AND SRC:MED`;
  const url = `${EPMC}?${new URLSearchParams({ query, format: 'json', pageSize: '100', resultType: 'core', sort: 'FIRST_PDATE_D desc' })}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Europe PMC ${res.status}`);
  const data = await res.json();
  const usedSet = new Set(used.map(s => String(s).toLowerCase()));
  const out = [];
  for (const r of data.resultList?.result || []) {
    const dec = x => String(x || '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
    const title = dec(r.title).replace(/<\/?[a-zA-Z][^>]*>/g, '');
    const abs = dec(r.abstractText).replace(/<\/?[a-zA-Z][^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const ids = [r.pmid, r.doi].filter(Boolean).map(s => String(s).toLowerCase());
    const types = (r.pubTypeList?.pubType || []).join(' ').toLowerCase();
    if (ids.some(i => usedSet.has(i))) continue;
    // must be mainly about Pakistan, and about people (not livestock)
    const pkMentions = (abs.match(/Pakistan/g) || []).length;
    if (!/Pakistan/i.test(title) && pkMentions < 2) continue;
    if (/livestock|cattle|bovine|poultry|veterinar|lumpy skin|animal/i.test(title + ' ' + abs)) continue;
    if (/withdrawn|retract|erratum|correction|protocol/i.test(title + ' ' + types)) continue;
    if (/comment|editorial|letter|news/.test(types) && !/review|research|article/.test(types)) continue;
    if (abs.length < 600) continue;
    // need real numbers to show graphically (percentages, counts)
    if ((abs.match(/\d+(\.\d+)?\s?%/g) || []).length < 2) continue;
    const pubDate = r.firstPublicationDate || r.firstIndexDate || '';
    if (pubDate < fromDate) continue;
    out.push({
      id: r.pmid || r.doi, pmid: r.pmid, doi: r.doi, title, abstract: abs,
      journal: r.journalInfo?.journal?.title || r.bookOrReportDetails?.publisher || '',
      pubDate, authors: r.authorString || '', firstAuthor: (r.authorList?.author?.[0]?.lastName) || (r.authorString || '').split(',')[0],
      types,
    });
    if (out.length >= max) break;
  }
  // keep only studies with real primary-health-care content, strongest first, then newest
  const CORE = /primary health ?care|primary care|lady health worker|community health worker|basic health unit|rural health cent|antenatal|prenatal|postnatal|skilled birth|immuni[sz]ation|vaccination|zero-dose|stunting|wasting|malnutrition|family planning|contracepti|health facilit|DHIS|health information system|HMIS|essential package|universal health coverage|maternal health service|cash transfer|nutrition programme|nutrition program/gi;
  const HOSPITAL = /tertiary|teaching hospital|intensive care|NICU|ICU|surgical|surgery|screening for congenital/i;
  const score = s => { const t = s.title + ' ' + s.abstract; return (t.match(CORE) || []).length - (HOSPITAL.test(t) ? 3 : 0); };
  return out.map((s, i) => ({ s, k: score(s), i })).filter(x => x.k >= 2).sort((a, b) => b.k - a.k || a.i - b.i).map(x => x.s);
}
