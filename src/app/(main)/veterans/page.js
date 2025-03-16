import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { config } from '@/config';
import { paths } from '@/paths';
import { VeteranModal } from '@/components/main/veteran/veteran-modal';
import { VeteransFilters } from '@/components/main/veteran/veterans-filters';
import { VeteransPagination } from '@/components/main/veteran/veterans-pagination';
import { VeteransTable } from '@/components/main/veteran/veterans-table';

export const metadata = { title: `List | Veterans | Dashboard | ${config.site.name}` };

// This would come from your API
const veterans = [
  {
    id: '29d8dae1191db7e9b9ed5dcbeb674012',
    name: {
      first: 'Carl',
      last: 'Conrad',
      middle: 'A',
      nickname: ''
    },
    address: {
      street: '250 South Forest Avenue Apt 312',
      city: 'West Bend',
      county: 'Washington',
      state: 'WI',
      zip: '53095',
      phone_day: '262-353-5392',
      phone_mbl: '',
      email: 'carlconrad606@gmail.com'
    },
    app_date: '2024-11-13',
    flight: {
      status: 'Active',
      group: '',
      bus: 'None',
      status_note: 'Guardian fee waiver. DK',
      waiver: false
    },
    birth_date: '1946-03-22',
    gender: 'M',
    vet_type: 'Vietnam',
    service: {
      branch: 'Navy',
      dates: '13 June 1966- 12 June 1968',
      rank: 'STG3',
      activity: ''
    },
    medical: {
      release: false,
      usesCane: false,
      usesWalker: false,
      usesWheelchair: false,
      usesScooter: false,
      isWheelchairBound: false,
      requiresOxygen: false,
      examRequired: false,
      limitations: '',
      level: '',
      alt_level: '',
      review: '',
      food_restriction: 'None'
    }
  },
  {"id":"29d8dae1191db7e9b9ed5dcbeb219056","_rev":"4-dd077330caac732ebb7b4cbf9befef5b","type":"Veteran","name":{"first":"Gene","last":"Cook","middle":"M","nickname":"Gene"},"address":{"street":"5216 County Road V","city":"Franksville","county":"Racine","state":"WI","zip":"53126","phone_day":"262-835-2520","phone_mbl":"262-865-7571","email":"benthorseshufarm@aol.com","phone_eve":""},"app_date":"2024-05-06","call":{"history":[],"assigned_to":"","fm_number":"","mail_sent":false,"email_sent":false,"notes":""},"mail_call":{"name":"","relation":"","address":{"phone":"","email":""},"notes":""},"flight":{"history":[{"id":"2025-01-11T16:08:26Z","change":"changed flight from: None to: SSHF-May2025 by: Jim Kliese"}],"id":"SSHF-May2025","confirmed_date":"","confirmed_by":"","seat":"","group":"","bus":"None","status":"Active","status_note":"Guardian fee waiver.mm","waiver":false},"guardian":{"pref_notes":"Sarah Cook","id":"29d8dae1191db7e9b9ed5dcbeb21e59a","name":"Sarah Cook","history":[{"id":"2024-05-07T20:11:46Z","change":"paired to: Sarah Cook by: Marge Meyers"}],"pref_phone":"262-880-1352","pref_email":"Captankid188@yahoo.com"},"birth_date":"1943-03-01","gender":"M","vet_type":"Vietnam","service":{"branch":"Army","dates":"nov 1962/nov 1965","rank":"E5","activity":""},"emerg_contact":{"name":"Marge Cook","address":{"phone":"262-497-3343","email":"benthorseshufarm@aol.com","street":"","city":"","state":"","zip":"","phone_eve":"","phone_mbl":""},"relation":""},"alt_contact":{"address":{"street":"","city":"","state":"","zip":"","phone":"","phone_eve":"","phone_mbl":"","email":""},"relation":"","name":""},"medical":{"release":false,"usesCane":false,"usesWalker":false,"usesWheelchair":false,"usesScooter":false,"isWheelchairBound":false,"requiresOxygen":false,"examRequired":false,"limitations":"","level":"","alt_level":"","review":"","food_restriction":"None"},"shirt":{"size":"L"},"weight":"","apparel":{"item":"None","date":"","delivery":"None","by":"","notes":"","jacket_size":"None","shirt_size":"None"},"metadata":{"created_at":"2024-05-06T23:58:17Z","created_by":"Online App (Marge Meyers)","updated_at":"2025-01-11T16:08:26Z","updated_by":"Jim Kliese"},"media_newspaper_ok":"Unknown","media_interview_ok":"Unknown","homecoming":{"destination":""},"accommodations":{"arrival_date":"","arrival_time":"","arrival_flight":"","hotel_name":"","room_type":"None","attend_banquette":"","banquette_guest":"","departure_date":"","departure_time":"","departure_flight":"","notes":""}}
];

export default function Page({ searchParams }) {
  const { status, flightGroup, branch, previewId, sortDir } = searchParams;

  const orderedVeterans = applySort(veterans, sortDir);
  const filteredVeterans = applyFilters(orderedVeterans, { status, flightGroup, branch });
  
  // Find the veteran to preview
  const previewVeteran = previewId 
    ? veterans.find(veteran => veteran.id === previewId)
    : null;

  return (
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
                Add
              </Button>
            </div>
          </Stack>
          <Card>
            <VeteransFilters filters={{ status, flightGroup, branch }} sortDir={sortDir} />
            <Divider />
            <Box sx={{ overflowX: 'auto' }}>
              <VeteransTable rows={filteredVeterans} />
            </Box>
            <Divider />
            <VeteransPagination count={filteredVeterans.length} page={0} />
          </Card>
        </Stack>
      </Box>
      <VeteranModal open={Boolean(previewId)} veteran={previewVeteran} />
    </React.Fragment>
  );
}

function applySort(rows, sortDir) {
  return rows.sort((a, b) => {
    if (sortDir === 'asc') {
      return new Date(a.app_date).getTime() - new Date(b.app_date).getTime();
    }
    return new Date(b.app_date).getTime() - new Date(a.app_date).getTime();
  });
}

function applyFilters(rows, { status, flightGroup, branch }) {
  return rows.filter((item) => {
    if (status && item.flight.status !== status) {
      return false;
    }
    if (flightGroup && item.flight.group !== flightGroup) {
      return false;
    }
    if (branch && item.service.branch !== branch) {
      return false;
    }
    return true;
  });
} 