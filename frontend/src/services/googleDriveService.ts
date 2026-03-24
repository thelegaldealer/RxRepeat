declare const google: any;

const CLIENT_ID = '1039610165380-fq361v8d0hps9vjaka34thfdbucv0g9a.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

export const googleDriveService = {
  tokenClient: null as any,
  accessToken: null as string | null,
  initPromise: null as Promise<void> | null,

  init: async (): Promise<void> => {
    // If we have a client, we are good.
    if (googleDriveService.tokenClient) return Promise.resolve();
    
    // Prevent multiple initializations running at once
    if (googleDriveService.initPromise) return googleDriveService.initPromise;

    googleDriveService.initPromise = new Promise((resolve, reject) => {
        let attempts = 0;
        const checkGoogle = () => {
            if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
                try {
                    googleDriveService.tokenClient = google.accounts.oauth2.initTokenClient({
                        client_id: CLIENT_ID,
                        scope: SCOPES,
                        callback: (response: any) => {
                            // Default callback updates token if it comes through this path
                            if (response.access_token) {
                                googleDriveService.accessToken = response.access_token;
                            }
                        },
                    });
                    console.log("Google Drive Token Client initialized");
                    resolve();
                } catch (e) {
                    console.error("Failed to init token client", e);
                    reject(e);
                }
            } else {
                attempts++;
                if (attempts > 50) { // 5 seconds timeout
                    console.error("Google Identity Services script failed to load in time.");
                    reject(new Error("Google Identity Services script failed to load. Please check your internet connection."));
                } else {
                    setTimeout(checkGoogle, 100);
                }
            }
        };
        checkGoogle();
    });
    
    return googleDriveService.initPromise;
  },

  uploadFile: async (file: File): Promise<string> => {
    // Ensure init is called
    await googleDriveService.init();

    if (!googleDriveService.tokenClient) {
        throw new Error("Google Drive Service failed to initialize. Please refresh the page.");
    }

    // Always request a new token for upload actions to ensure validity
    await new Promise<void>((resolve, reject) => {
        try {
            // We override the callback for this specific request to handle the promise flow
            googleDriveService.tokenClient.callback = (resp: any) => {
                if (resp.error) {
                    reject(new Error(`Authorization failed: ${resp.error}`));
                } else {
                    googleDriveService.accessToken = resp.access_token;
                    resolve();
                }
            };
            
            // Trigger the popup
            googleDriveService.tokenClient.requestAccessToken({ prompt: 'consent' });
        } catch (e) {
            reject(e);
        }
    });
    

    if (!googleDriveService.accessToken) {
        throw new Error("Failed to obtain access token.");
    }

    // Upload Metadata + File using Multipart upload
    const metadata = {
        name: file.name,
        mimeType: file.type,
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
        method: 'POST',
        headers: { Authorization: `Bearer ${googleDriveService.accessToken}` },
        body: form
    });

    if (!uploadResponse.ok) {
        const err = await uploadResponse.json();
        console.error("Drive API Error:", err);
        throw new Error('Failed to upload file to Google Drive. Check console for details.');
    }

    const fileData = await uploadResponse.json();
    
    // Set Permissions to "Anyone with link can view" (Reader)
    try {
        await fetch(`https://www.googleapis.com/drive/v3/files/${fileData.id}/permissions`, {
            method: 'POST',
            headers: { 
                Authorization: `Bearer ${googleDriveService.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                role: 'reader',
                type: 'anyone'
            })
        });
    } catch (permError) {
        console.warn("Could not set public permissions automatically:", permError);
    }

    return fileData.webViewLink;
  }
};