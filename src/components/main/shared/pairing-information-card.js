'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Controller } from 'react-hook-form';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Gear, Eye, Users } from '@phosphor-icons/react';
import { paths } from '@/paths';
import { FormSectionHeader } from './form-section-header';
import { pushNavigationEntry } from '@/lib/navigation-stack';

export function PairingInformationCard({
  control,
  errors,
  cardId,
  cardRef,
  title,
  icon = Users,
  pairingType, // 'guardian' or 'veteran' - determines field names and navigation
  preferenceNotesFieldName, // e.g., 'guardian.pref_notes' or 'veteran.pref_notes'
  preferenceNotesPlaceholder,
  onManagePairing,
  showHiddenFields = false, // Only for veteran form
  entity // The main entity (veteran or guardian) for accessing pairing data
}) {
  const router = useRouter();
  
  // Determine if we have pairings to display
  const hasPairings = pairingType === 'guardian' 
    ? (entity?.guardian?.id && entity?.guardian?.name)
    : (entity?.veteran?.pairings?.length > 0);
  
  // Get pairings array - handle both single and multiple
  const pairingsArray = pairingType === 'guardian'
    ? (entity?.guardian?.id && entity?.guardian?.name ? [entity.guardian] : [])
    : (entity?.veteran?.pairings || []);
  
  // Determine label text
  const pairingLabel = pairingType === 'guardian' 
    ? 'Currently Paired Guardian'
    : 'Currently Paired Veterans';
  
  // Get navigation details
  const getNavigationDetails = (pairing) => {
    if (pairingType === 'guardian') {
      return {
        type: 'guardian-details',
        url: paths.main.guardians.details(pairing.id),
        title: 'Back to Veteran Details'
      };
    } else {
      return {
        type: 'veteran-details',
        url: paths.main.veterans.details(pairing.id),
        title: 'Back to Guardian Details'
      };
    }
  };
  
  // Calculate grid size for notes field
  const notesGridSize = hasPairings ? 5.5 : 12;

  return (
    <Card 
      id={cardId} 
      elevation={2} 
      sx={{ '&:hover': { transform: 'translateY(-2px)' } }} 
      ref={cardRef}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
          <FormSectionHeader 
            icon={icon} 
            title={title} 
          />
          <Button
            startIcon={<Gear size={18} weight="bold" />}
            variant="outlined"
            size="small"
            onClick={onManagePairing}
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 'medium'
            }}
          >
            Manage Pairing
          </Button>
        </Stack>
        <Grid container spacing={3}>
          {hasPairings && (
            <>
              <Grid xs={12} md={6}>
                <InputLabel sx={{ mb: 2 }}>{pairingLabel}</InputLabel>
                <Stack spacing={2}>
                  {pairingsArray.map((pairing, index) => {
                    const navDetails = getNavigationDetails(pairing);
                    return (
                      <Card
                        key={pairing.id || index}
                        variant="outlined"
                        onClick={() => {
                          pushNavigationEntry(navDetails);
                          router.push(navDetails.url);
                        }}
                        sx={{
                          textDecoration: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: 2,
                            borderColor: 'primary.main',
                            cursor: 'pointer'
                          },
                          '& *': {
                            cursor: 'pointer'
                          }
                        }}
                      >
                        <CardContent sx={{ py: 1, px: 2, cursor: 'pointer', '&:last-child': { pb: 1 } }}>
                          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                            <Typography variant="body1" color="text.primary" sx={{ cursor: 'pointer' }}>
                              {pairing.name}
                            </Typography>
                            <Eye size={20} color="var(--mui-palette-primary-main)" style={{ cursor: 'pointer' }} />
                          </Stack>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              </Grid>
              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, mx: 2 }} />
            </>
          )}
          <Grid xs={12} md={notesGridSize}>
            <InputLabel sx={{ mb: 2 }}>
              {preferenceNotesPlaceholder}
            </InputLabel>
            <Controller
              control={control}
              name={preferenceNotesFieldName}
              render={({ field }) => {
                const [prefix, fieldName] = preferenceNotesFieldName.split('.');
                const fieldError = errors[prefix]?.[fieldName];
                return (
                  <FormControl error={Boolean(fieldError)} fullWidth>
                    <OutlinedInput {...field} multiline rows={8} placeholder={preferenceNotesPlaceholder} />
                    {fieldError && <FormHelperText>{fieldError.message}</FormHelperText>}
                  </FormControl>
                );
              }}
            />
          </Grid>
          {showHiddenFields && pairingType === 'guardian' && entity?.guardian && (
            <>
              <Controller
                control={control}
                name="guardian.id"
                render={({ field }) => (
                  <input type="hidden" {...field} />
                )}
              />
              <Controller
                control={control}
                name="guardian.name"
                render={({ field }) => (
                  <input type="hidden" {...field} />
                )}
              />
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}

