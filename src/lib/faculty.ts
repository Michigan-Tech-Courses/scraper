import got from 'got/dist/source';
import pLimit from 'p-limit';
import cheerio from 'cheerio';
import {FACULTY_PAGES} from './constants';
import {IFaculty} from './types';
import {decodeCloudflareObfuscatedEmail, removeEmptyElements, resolvePartialURL, trim} from './utils';
import gotWrapper from './got';

export const getAllFaculty = async (): Promise<IFaculty[]> => {
  const limit = pLimit(3);

  const scrapedPages = await Promise.all(FACULTY_PAGES.map(pageURL => limit(async () => {
    const {body} = await gotWrapper(got.get(pageURL));

    const $ = cheerio.load(body);

    const department = trim($('.title span > a').text());

    const people: IFaculty[] = [];
    $('.person').each((_, element) => {
      const node = $(element);

      let nameElement = node.find('.personal h2 a');

      if (nameElement.length === 0) {
        nameElement = node.find('.personal h2');
      }

      let name = trim(nameElement.text());

      // Remove any attributes after name
      if (name.includes(',')) {
        name = name.split(',')[0];
      }

      const occupations = node.find('.personal > ul li').toArray().map(occupation => trim($(occupation).text()));

      const emailElement = node.find('.left > .contact .email-address > a');

      let email: string;

      if (emailElement.find('span[data-cfemail]').length > 0) {
        // Decode email
        email = decodeCloudflareObfuscatedEmail(emailElement.find('span[data-cfemail]').attr('data-cfemail')!);
      } else {
        email = trim(emailElement.text());
      }

      const phone = trim(node.find('.left > .contact .phone-number > a').text());

      const office = trim(node.find('.left > .contact .place').text());

      const websiteURL = node.find('.left.specialties > ul > li > a:contains("Faculty")').attr('href');

      const photoURL = node.find('img').attr('src');

      const interestsParent = node.find('.right.specialties > ul li').toArray().length > 0 ? node.find('.right.specialties > ul li') : node.find('.right .specialties > ul li');

      const interests = interestsParent.toArray().map(interest => trim($(interest).text()));

      people.push({
        name,
        departments: removeEmptyElements([department]),
        occupations: removeEmptyElements(occupations),
        email: email === '' ? null : email,
        phone: phone === '' ? null : phone,
        office: office === '' ? null : office,
        websiteURL: websiteURL ? resolvePartialURL(websiteURL) : null,
        photoURL: photoURL ? resolvePartialURL(photoURL) : null,
        interests: removeEmptyElements(interests)
      });
    });

    return people;
  })));

  const flatPeople = ([] as IFaculty[]).concat(...scrapedPages);

  // Some people may work in multiple departments and thus appear twice
  const peopleMap = new Map<string, IFaculty>();

  // Merge with departments
  flatPeople.forEach(person => {
    const personInMap = peopleMap.get(person.name);

    if (personInMap) {
      peopleMap.set(person.name, {
        ...personInMap,
        departments: removeEmptyElements([...personInMap.departments, ...person.departments])
      });
    } else {
      peopleMap.set(person.name, person);
    }
  });

  return Array.from(peopleMap.values());
};
