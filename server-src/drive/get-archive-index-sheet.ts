import {google, drive_v3, sheets_v4} from 'googleapis';
import {OAuth2Client} from 'google-auth-library';
import getArchiveFolder from './get-archive-folder';
import findFile from './find-file';
import {DRIVE_ARCHIVE_INDEX_SHEET, MIME_TYPES} from '../config';
import {ISheet} from '../interfaces/sheet';

const drive = google.drive('v3');
const sheets = google.sheets('v4');

const headerRowContent = [
  'Exported file name',
  'Source Fusiontable',
  'Exported Spreadsheet/CSV',
  'Visualization',
  'Exported at'
].join(',');

/**
 * Get the Archive Index Sheet
 */
export default async function(auth: OAuth2Client): Promise<ISheet> {
  const archiveFolderId = await getArchiveFolder(auth);
  const spreadsheetId = await findFile(
    auth,
    DRIVE_ARCHIVE_INDEX_SHEET,
    archiveFolderId
  );

  if (!spreadsheetId) {
    return createSheet(auth, archiveFolderId);
  }

  const sheetId = await getFirstSheet(auth, spreadsheetId);

  return {
    spreadsheetId,
    sheetId
  };
}

/**
 * Get the first sheet in a spreadsheet
 */
async function getFirstSheet(
  auth: OAuth2Client,
  spreadsheetId: string
): Promise<number> {
  const sheetsResponse = await sheets.spreadsheets.get({
    auth,
    spreadsheetId,
    fields: 'sheets'
  });

  const firstSheet = (sheetsResponse.data
    .sheets as sheets_v4.Schema$Sheet[])[0];
  const sheetId = firstSheet.properties && firstSheet.properties.sheetId;

  if (!sheetId) {
    throw new Error('No sheet in Spreadsheet found not found');
  }

  return sheetId;
}

/**
 * Create the Archive Index Sheet with a title row
 */
async function createSheet(
  auth: OAuth2Client,
  archiveFolderId: string
): Promise<ISheet> {
  const createResponse = await drive.files.create({
    auth,
    resource: {
      name: DRIVE_ARCHIVE_INDEX_SHEET,
      parents: [archiveFolderId],
      mimeType: MIME_TYPES.spreadsheet
    },
    media: {
      mimeType: MIME_TYPES.csv,
      body: headerRowContent
    }
  } as drive_v3.Params$Resource$Files$Create);

  if (createResponse.statusText !== 'OK') {
    console.error('ERROR!', createResponse);
  }

  const spreadsheetId = createResponse.data.id as string;
  const sheetId = await getFirstSheet(auth, spreadsheetId);

  await sheets.spreadsheets.batchUpdate({
    auth,
    spreadsheetId,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 0,
              endRowIndex: 1
            },
            cell: {
              userEnteredFormat: {
                horizontalAlignment: 'CENTER',
                textFormat: {
                  fontSize: 12,
                  bold: true
                }
              }
            },
            fields: 'userEnteredFormat(textFormat,horizontalAlignment)'
          }
        },
        {
          updateDimensionProperties: {
            range: {
              sheetId,
              dimension: 'COLUMNS',
              startIndex: 0,
              endIndex: 5
            },
            properties: {
              pixelSize: 250
            },
            fields: 'pixelSize'
          }
        },
        {
          updateSheetProperties: {
            properties: {
              sheetId,
              gridProperties: {
                frozenRowCount: 1
              }
            },
            fields: 'gridProperties.frozenRowCount'
          }
        }
      ]
    }
  } as sheets_v4.Params$Resource$Spreadsheets$Batchupdate);

  return {
    spreadsheetId,
    sheetId
  };
}