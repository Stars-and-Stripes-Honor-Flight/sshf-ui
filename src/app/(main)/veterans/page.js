'use client'

import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Option } from '@/components/core/option';

import { paths } from '@/paths';
import { config } from '@/config';
import { ApiTable } from '@/components/core/table/api-table';

import { veteranColumns } from '@/components/main/search/search-columns';

export default function Page() {

  let veteranTableCustomVeteran = vet => {

    return {
      ...vet,
      id: vet.VeteranID,
    }
  };

  const today = new Date();
  let todayText = today.toISOString();
  const veteranTabs = [
    { label: 'Current', value: 'current', filter: `ExpDateUTC gt ${todayText} and EffDateUTC lt ${todayText}` },
    { label: 'Future', value: 'future', filter: `EffDateUTC gt ${todayText}` }
  ];
  
  const [veteranFilters, setVeteranFilters] = React.useState([]);

  const updateVeteranFilters = (newVeteranFilter) => {
    setVeteranFilters(newVeteranFilter);
  }

  const [readyToFetch, setReadyToFetch] = React.useState(false);


  React.useEffect(() => {
    document.title = `Veterans | ${config.site.name}`;


  }, []);

  /* Why two useEffects? 
  * The first use effect is loading in the extra data the grid needs to populate the combo filter
  * Once that is done, then this second use effect fires off because of the filters[] array change
  * Which then tells the table it can start fetching the data from the API to populate the table
  */
  React.useEffect(() => {
    if (veteranFilters.length > 0) {
      setReadyToFetch(true);
    }
  }, [veteranFilters])

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
                <Typography variant="h4">Veterans</Typography>
              </Box>
              <div>
                <Button
                  component={RouterLink}
                  href={paths.main.veterans.create}
                  startIcon={<PlusIcon />}
                  variant="contained"
                >
                  Add Veteran
                </Button>
              </div>
            </Stack>
            <Card>
              <ApiTable 
                entity='ClientFieldVeteran'
                entityFriendlyName='Veterans'
                columns={veteranColumns}
                readyToFetch={readyToFetch}
                customVeteran={veteranTableCustomVeteran}
                tabs={veteranTabs}
                updateVeteranFilters={updateVeteranFilters}
                filters={veteranFilters}
                urlParams='$orderby=EffDateUTC' />
            </Card>
          </Stack>
        </Box>
      </React.Fragment>
    </React.Suspense>
  );
}
