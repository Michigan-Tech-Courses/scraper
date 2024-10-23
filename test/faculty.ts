import test from 'ava';
import fs from 'fs';
import nock from 'nock';
import td from 'testdouble';
import * as constants from './helpers/constants';

td.replace('../src/lib/constants', constants);

import {getAllFaculty} from '../src';

test('getAllFaculty() works correctly', async t => {
  nock('https://www.mtu.edu')
    .get('/cs/department/people/')
    .reply(200, await fs.promises.readFile('./test/resources/cs-faculty.html'))

    .get('/chemistry/people-groups/faculty-staff/')
    .reply(200, await fs.promises.readFile('./test/resources/chemistry-faculty.html'))

    .get('/business/people-groups/faculty/')
    .reply(200, await fs.promises.readFile('./test/resources/faculty-with-obfuscated-emails.html'))

    .get('/cege/people/faculty-staff/')
    .reply(200, await fs.promises.readFile('./test/resources/faculty-with-attributes.html'));

  const people = await getAllFaculty();

  t.snapshot(people);
});
