import { getEnvVars } from "../config";
import {
  AidCodeType,
  TicketProcessingFileType,
  TicketProcessingResultType,
} from "../types";
import { isReactNativeFile } from "../utils/files";

export async function processTicketImage(
  aid_id: AidCodeType,
  imageFile: TicketProcessingFileType,
  authorization: string
): Promise<TicketProcessingResultType> {
  const { BACK_END_URL } = getEnvVars();

  let file;

  if (isReactNativeFile(imageFile)) {
    file = {
      uri: imageFile.uri,
      name: imageFile.name,
      type: imageFile.type,
    } as unknown as Blob;
  } else {
    file = imageFile;
  }

  const formData = new FormData();
  formData.append("aid_id", aid_id.toString());
  formData.append("images", file);

  try {
    const response = await fetch(`${BACK_END_URL}/ticket_processing/upload/`, {
      method: "POST",
      headers: {
        Authorization: authorization,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `sendTicket !response.ok error: ${response.status}: ${errorText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error(error);
    const e = error as any;
    const message =
      e.reason || e.data?.message || e.message || "Unknown sendTicket error";
    throw new Error(`sendTicket Error: ${message}`);
  }
}
