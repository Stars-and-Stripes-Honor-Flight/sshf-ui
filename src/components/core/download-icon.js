import * as React from 'react';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { config } from '@/config';
import { saveFile } from '@/lib/file';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { CloudArrowDown as CloudArrowDownIcon } from '@phosphor-icons/react/dist/ssr/CloudArrowDown';
import { toast } from '@/components/core/toaster';
import { useUser } from '@/hooks/use-user';

export function DownloadIcon({ objectKey }) {
    const { user, client } = useUser();

    const handleDownloadObject = React.useCallback(
        async (objectKey) => {
            try {
            const s3Client = new S3Client({
                region: client.region,
                credentials: fromCognitoIdentityPool({
                clientConfig: { region: client.region },
                identityPoolId: config.cognito.identityPoolId,
                logins: { [user.iss]: user?.jwt.toString() },
                }),
            });
            const command = new GetObjectCommand({ Bucket: client.bucketID, Key: objectKey });
            const response = await s3Client.send(command);
        
            saveFile({
                fileName: objectKey,
                contents: await response.Body.transformToString()
            });
            } catch (error) {
                toast.error('Something went wrong! Or we could not find the file');
                console.error('Error fetching objects:', error);
            }

        },
        [objectKey]
    );

  return (
    <Box  sx={{ cursor: 'pointer', display: objectKey ? undefined : "none" }} onClick={() => { handleDownloadObject(objectKey) }}>
        <Tooltip title="Download" >
            <CloudArrowDownIcon fontSize="1.5rem"  />
        </Tooltip>
    </Box>
  );
}
