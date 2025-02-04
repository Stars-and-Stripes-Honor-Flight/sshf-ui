'use client'

import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { paths } from '@/paths';
import { config } from '@/config';
import { ApiTable } from '@/components/core/table/api-table';

import { searchColumns } from '@/components/main/search/search-columns';

export default function Page() {

  const today = new Date();
  let todayText = today.toISOString();
  
  const [searchFilters, setSearchFilters] = React.useState([
    { property: "lastName", propertyFriendlyName: "Last Name", filterType: "text" },
    { property: "firstName", propertyFriendlyName: "First Name", filterType: "text" },
    { property: "city", propertyFriendlyName: "City", filterType: "text" },
    { property: "phone", propertyFriendlyName: "Phone Number", filterType: "text" },
    { property: "branch", propertyFriendlyName: "Military Branch", filterType: "text" },
    { property: "guardian", propertyFriendlyName: "Is Guardian", filterType: "text" }
  ]);

  const updatesearchFilters = (newsearchFilter) => {
    setSearchFilters(newsearchFilter);
  }

  const [readyToFetch, setReadyToFetch] = React.useState(true);


  React.useEffect(() => {
    document.title = `Search Veterans & Guardians | ${config.site.name}`;
  }, []);

  /* Why two useEffects? 
  * The first use effect is loading in the extra data the grid needs to populate the combo filter
  * Once that is done, then this second use effect fires off because of the filters[] array change
  * Which then tells the table it can start fetching the data from the API to populate the table
  */
  React.useEffect(() => {
    if (searchFilters.length > 0) {
      setReadyToFetch(true);
    }
  }, [searchFilters])

  return (
    <React.Suspense>
      <React.Fragment>
        <Box
          sx={{
            maxWidth: 'var(--Content-maxWidth)',
            m: 'var(--Content-margin)',
            p: 'var(--Content-padding)',
            width: 'var(--Content-width)',
          }}
        >
          <Stack spacing={4}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: 'flex-start' }}>
              <Box sx={{ flex: '1 1 auto' }}>
                <Typography variant="h4">Search Veterans & Guardians</Typography>
                <iframe src="http://localhost:8080/msg" width="600" height="70" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
              </Box>
            </Stack>
            <Card>
              <ApiTable 
                entity='VeteransAndGuardians'
                entityFriendlyName='Search Veterans & Guardians'
                columns={searchColumns}
                readyToFetch={readyToFetch}
                updatesearchFilters={updatesearchFilters}
                filters={searchFilters} />
            </Card>
          </Stack>
        </Box>
      </React.Fragment>
    </React.Suspense>
  );
}
