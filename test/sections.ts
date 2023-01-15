import test from 'ava';
import fs from 'fs';
import nock from 'nock';
import td from 'testdouble';
import * as constants from './helpers/constants';

td.replace('../src/lib/constants', constants);

import {getAllSections, getSectionDetails} from '../src';

const term = new Date();
term.setFullYear(2020, 7);

test('getAllSections() works correctly', async t => {
  nock('https://www.banweb.mtu.edu')
    .get('/pls/owa/bzckschd.p_get_crse_unsec')
    .query(true)
    .reply(200, await fs.promises.readFile('./test/resources/all-sections.html'));

  const sections = await getAllSections(new Date());

  t.snapshot(sections);
});

test('getSectionDetails() works correctly', async t => {
  const options = {term, subject: 'CS', crse: '123', crn: '123'};

  const response = await fs.promises.readFile('./test/resources/section.html');
  nock('https://www.banweb.mtu.edu')
    .get('/owassb/bwckschd.p_disp_listcrse')
    .query({
      term_in: '202008',
      subj_in: options.subject,
      crse_in: options.crse,
      crn_in: options.crn
    })
    .reply(200, response);

  const section = await getSectionDetails(options);

  t.snapshot(section);
});

test('getSectionDetails() works with prereqs', async t => {
  const options = {term, subject: 'CS', crse: '123', crn: '123'};

  const response = await fs.promises.readFile('./test/resources/section-with-prereqs.html');
  nock('https://www.banweb.mtu.edu')
    .get('/owassb/bwckschd.p_disp_listcrse')
    .query({
      term_in: '202008',
      subj_in: options.subject,
      crse_in: options.crse,
      crn_in: options.crn
    })
    .reply(200, response);

  const section = await getSectionDetails(options);

  t.snapshot(section);
});

test('getSectionDetails() works with multiple instructors', async t => {
  const options = {term, subject: 'CS', crse: '123', crn: '123'};

  const response = await fs.promises.readFile('./test/resources/section-with-multiple-instructors.html');
  nock('https://www.banweb.mtu.edu')
    .get('/owassb/bwckschd.p_disp_listcrse')
    .query({
      term_in: '202008',
      subj_in: options.subject,
      crse_in: options.crse,
      crn_in: options.crn
    })
    .reply(200, response);

  const section = await getSectionDetails(options);

  t.snapshot(section);
});

test('getSectionDetails() throws if section doesn\'t exist', async t => {
  const options = {term, subject: 'CS', crse: '123', crn: '123'};

  const response = await fs.promises.readFile('./test/resources/section-not-found.html');
  nock('https://www.banweb.mtu.edu')
    .get('/owassb/bwckschd.p_disp_listcrse')
    .query({
      term_in: '202008',
      subj_in: options.subject,
      crse_in: options.crse,
      crn_in: options.crn
    })
    .reply(200, response);

  await t.throwsAsync(async () => getSectionDetails(options), {message: 'Course not found'});
});

test('getSectionDetails() works for courses offered on demand', async t => {
  const options = {term, subject: 'CS', crse: '123', crn: '123'};

  const response = await fs.promises.readFile('./test/resources/section-offered-on-demand.html');
  nock('https://www.banweb.mtu.edu')
    .get('/owassb/bwckschd.p_disp_listcrse')
    .query({
      term_in: '202008',
      subj_in: options.subject,
      crse_in: options.crse,
      crn_in: options.crn
    })
    .reply(200, response);

  const result = await getSectionDetails(options);

  t.is(result.semestersOffered.length, 0);
});

test('getSectionDetails() works after bug was introduced in banweb', async t => {
  const options = {term, subject: 'CS', crse: '123', crn: '123'};

  const response = await fs.promises.readFile('./test/resources/section-with-bug.html');
  nock('https://www.banweb.mtu.edu')
    .get('/owassb/bwckschd.p_disp_listcrse')
    .query({
      term_in: '202008',
      subj_in: options.subject,
      crse_in: options.crse,
      crn_in: options.crn
    })
    .reply(200, response);

  const result = await getSectionDetails(options);

  t.deepEqual(result.instructors, [
    'Soner Onder'
  ]);
});

test('getSectionDetails() throws if invalid term', async t => {
  const options = {term, subject: 'CS', crse: '123', crn: '123'};

  const response = await fs.promises.readFile('./test/resources/section-invalid-term.html');
  nock('https://www.banweb.mtu.edu')
    .get('/owassb/bwckschd.p_disp_listcrse')
    .query({
      term_in: '202008',
      subj_in: options.subject,
      crse_in: options.crse,
      crn_in: options.crn
    })
    .reply(200, response);

  await t.throwsAsync(async () => {
    await getSectionDetails(options);
  }, {
    message: 'Invalid term'
  });
});
