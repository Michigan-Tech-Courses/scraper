import got from 'got';
import cheerio from 'cheerio';
import {URLSearchParams} from 'url';
import {ESemester, ICourseOverview, IScrapedSection, ISectionDetails} from './types';
import {trim, getTermId, protectNaN, getNumberOfUniqueValues} from './utils';
import gotWrapper from './got';

/*
 * The month of term must be sent to the first month of a term at Michigan Tech.
 * const fallTerm = new Date();
 * fallTerm.setMonth(7); // zero-indexed
 */
export const getAllSections = async (term: Date): Promise<ICourseOverview[]> => {
  const response = await gotWrapper(got.get('https://www.banweb.mtu.edu/pls/owa/bzckschd.p_get_crse_unsec', {
    searchParams: new URLSearchParams([
      ['term_in', getTermId(term)],
      ['sel_subj', 'dummy'],
      ['sel_day', 'dummy'],
      ['sel_schd', 'dummy'],
      ['sel_insm', 'dummy'],
      ['sel_camp', 'dummy'],
      ['sel_levl', 'dummy'],
      ['sel_sess', 'dummy'],
      ['sel_instr', 'dummy'],
      ['sel_ptrm', 'dummy'],
      ['sel_attr', 'dummy'],
      ['sel_subj', ''],
      ['sel_crse', ''],
      ['sel_title', ''],
      ['sel_schd', ''],
      ['sel_from_cred', ''],
      ['sel_to_cred', ''],
      ['sel_levl', '%'],
      ['sel_ptrm', '%'],
      ['sel_instr', '%'],
      ['sel_attr', '%'],
      ['begin_hh', '0'],
      ['begin_mi', '0'],
      ['begin_ap', 'a'],
      ['end_hh', '0'],
      ['end_mi', '0'],
      ['end_ap', 'a']
    ])
  }));

  const $ = cheerio.load(response.body);

  const sections: IScrapedSection[] = [];

  $('.datadisplaytable tr').each((_, element) => {
    const attributes = $(element).children('.dddefault, .dddefaultnoprint');

    const crn = trim(attributes.eq(0).children().eq(0).text());

    // Ignore rows without a CRN
    if (crn === '') {
      return;
    }

    const subject: string = trim(attributes.eq(1).text());
    const crse = trim(attributes.eq(2).text());
    const section = trim(attributes.eq(3).text());
    const cmp = trim(attributes.eq(4).text());

    const rawCredits = trim(attributes.eq(5).text());

    let credits: number[] = [];

    if (rawCredits.includes('-')) {
      credits = rawCredits.split('-').map((credit: string) => Number(credit));
    } else if (rawCredits.includes('/')) {
      credits = rawCredits.split('/').map((credit: string) => Number(credit));
    } else if (Number.isNaN((rawCredits))) {
      credits = [0];
    } else {
      credits = [Number(rawCredits)];
    }

    const title = trim(attributes.eq(6).text());
    const days = trim(attributes.eq(7).text());

    const [startTime, endTime] = attributes.eq(8).text().trim().split('-');

    const seats = Number(attributes.eq(9).text().trim());
    const seatsTaken = Number(attributes.eq(10).text().trim());
    const seatsAvailable = Number(attributes.eq(11).text().trim());
    const instructor = trim(attributes.eq(12).text());

    const [startDate, endDate] = attributes.eq(13).text().trim().split('-');

    let location: string | null = trim(attributes.eq(14).text());
    if (location === 'TBA') {
      location = null;
    }

    const potentialFee = trim(attributes.eq(15).text());

    let fee = 0;

    if (potentialFee.includes('$')) {
      fee = potentialFee.match(/\d+(?:\.\d+)?/g)!.reduce((accum, fee) => {
        return accum + (Number(fee) * 100); // Cents
      }, 0);
    }

    sections.push({
      crn,
      subject,
      crse,
      section,
      cmp,
      creditRange: credits,
      title,
      days,
      timeRange: startTime === 'TBA' ? null : [startTime, endTime],
      seats: protectNaN(seats),
      seatsTaken: protectNaN(seatsTaken),
      seatsAvailable: protectNaN(seatsAvailable),
      instructors: instructor,
      dateRange: [startDate, endDate],
      location,
      fee: protectNaN(fee)
    });
  });

  // Collect sections into courses
  const coursesMap = new Map<string, IScrapedSection[]>();

  sections.forEach(section => {
    const id = `${section.subject}${section.crse}`;
    coursesMap.set(id, coursesMap.get(id) ? [...coursesMap.get(id)!, section] : [section]);
  });

  const courses: ICourseOverview[] = [];

  for (let [,sections] of coursesMap) {
    // Guaranteed that at least one section exists, otherwise it wouldn't be in map
    const sampleSection = sections[0]!;

    courses.push({
      subject: sampleSection.subject,
      crse: sampleSection.crse,
      title: getNumberOfUniqueValues(sections.map(s => s.title)) > 1 ? `${sampleSection.subject as string} ${sampleSection.crse as string}` : sampleSection.title,
      sections: sections.map(s => ({
        crn: s.crn,
        section: s.section,
        cmp: s.cmp,
        creditRange: s.creditRange,
        days: s.days,
        timeRange: s.timeRange,
        seats: s.seats,
        seatsTaken: s.seatsTaken,
        seatsAvailable: s.seatsAvailable,
        instructors: s.instructors.split(',').map(i => trim(i)),
        dateRange: s.dateRange,
        location: s.location,
        fee: s.fee
      }))
    });
  }

  return courses;
};

export const getSectionDetails = async ({term, subject, crse, crn}: {term: Date; subject: string; crse: string; crn: string}): Promise<ISectionDetails> => {
  const {body} = await gotWrapper(got.get('https://www.banweb.mtu.edu/owassb/bwckschd.p_disp_listcrse', {
    searchParams: {
      term_in: getTermId(term),
      subj_in: subject,
      crse_in: crse,
      crn_in: crn
    }
  }));

  const $ = cheerio.load(body);

  if (!$.contains($('body').get(0), $('table td.dddefault').get(0))) {
    throw new Error('Course not found');
  }

  const title = trim($('table td.dddefault b').first().text());
  const description = trim($('p.small').text());
  const instructors = trim($('[summary="This table lists the scheduled meeting times and assigned instructors for this class.."] tr:nth-child(2) td:nth-child(6)').text());

  const location = trim($('[summary="This table lists the scheduled meeting times and assigned instructors for this class.."] tr:nth-child(2) td:nth-child(4)').text());

  const prereqSibling = $('strong').filter((_, element) => $(element).text().includes('Requisite'));

  const prereqs = trim(prereqSibling.parent().contents().filter((_, element) => element.type === 'text').text());

  const creditsSibling = $('strong').filter((_, element) => $(element).text().includes('Credits'));
  const credits = trim(creditsSibling.parent().contents().filter((_, element) => element.type === 'text').text());

  const semestersOfferedSibling = $('strong').filter((_, element) => $(element).text().includes('Offered'));
  const semestersOffered = trim(semestersOfferedSibling.parent().contents().filter((_, element) => element.type === 'text').text()).split(',').reduce<ESemester[]>((semesters, s) => {
    if (Object.values(ESemester).includes(s.trim() as ESemester)) {
      return [...semesters, s.trim() as ESemester];
    }

    return semesters;
  }, []);

  return {
    title,
    description,
    instructors: instructors === 'TBA' ? [] : instructors.split(',').map(i => trim(i)),
    prereqs: prereqs === '' ? null : prereqs,
    credits: Number(credits),
    semestersOffered,
    location
  };
};
