[@mtucourses/scraper](../README.md) / [Modules](../modules.md) / index

# Module: index

## Table of contents

### Enumerations

- [ESemester](../enums/index.esemester.md)

### Interfaces

- [ICourseOverview](../interfaces/index.icourseoverview.md)
- [IFaculty](../interfaces/index.ifaculty.md)
- [IScheduleDef](../interfaces/index.ischeduledef.md)
- [IScrapedSection](../interfaces/index.iscrapedsection.md)
- [ISection](../interfaces/index.isection.md)
- [ISectionDetails](../interfaces/index.isectiondetails.md)
- [ITransferCourse](../interfaces/index.itransfercourse.md)

### Functions

- [getAllFaculty](index.md#getallfaculty)
- [getAllSections](index.md#getallsections)
- [getAllTransferCourses](index.md#getalltransfercourses)
- [getSectionDetails](index.md#getsectiondetails)

## Functions

### getAllFaculty

▸ `Const`**getAllFaculty**(): *Promise*<[*IFaculty*](../interfaces/lib/types.ifaculty.md)[]\>

**Returns:** *Promise*<[*IFaculty*](../interfaces/lib/types.ifaculty.md)[]\>

Defined in: [lib/faculty.ts:9](https://github.com/Michigan-Tech-Courses/scrapper/blob/444bab4/src/lib/faculty.ts#L9)

___

### getAllSections

▸ `Const`**getAllSections**(`term`: Date): *Promise*<[*ICourseOverview*](../interfaces/lib/types.icourseoverview.md)[]\>

#### Parameters:

Name | Type |
------ | ------ |
`term` | Date |

**Returns:** *Promise*<[*ICourseOverview*](../interfaces/lib/types.icourseoverview.md)[]\>

Defined in: [lib/sections.ts:14](https://github.com/Michigan-Tech-Courses/scrapper/blob/444bab4/src/lib/sections.ts#L14)

___

### getAllTransferCourses

▸ `Const`**getAllTransferCourses**(): *Promise*<[*ITransferCourse*](../interfaces/lib/types.itransfercourse.md)[]\>

**Returns:** *Promise*<[*ITransferCourse*](../interfaces/lib/types.itransfercourse.md)[]\>

Defined in: [lib/transfer.ts:8](https://github.com/Michigan-Tech-Courses/scrapper/blob/444bab4/src/lib/transfer.ts#L8)

___

### getSectionDetails

▸ `Const`**getSectionDetails**(`__namedParameters`: { `crn`: *string* ; `crse`: *string* ; `subject`: *string* ; `term`: Date  }): *Promise*<[*ISectionDetails*](../interfaces/lib/types.isectiondetails.md)\>

#### Parameters:

Name | Type |
------ | ------ |
`__namedParameters` | { `crn`: *string* ; `crse`: *string* ; `subject`: *string* ; `term`: Date  } |

**Returns:** *Promise*<[*ISectionDetails*](../interfaces/lib/types.isectiondetails.md)\>

Defined in: [lib/sections.ts:176](https://github.com/Michigan-Tech-Courses/scrapper/blob/444bab4/src/lib/sections.ts#L176)
