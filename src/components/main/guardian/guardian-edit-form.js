'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
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
import Tooltip from '@mui/material/Tooltip';
import { Controller, useForm } from 'react-hook-form';
import { 
  Person,
  ArrowUp
} from '@phosphor-icons/react';

import { logger } from '@/lib/default-logger';
import { toast } from '@/components/core/toaster';
import { api } from '@/lib/api';
import { getFlights, formatFlightNameForDisplay } from '@/lib/flights';
import { HistoryDialog } from '@/components/core/history-dialog';
import { GoodToFlyStatus } from '@/components/main/shared/good-to-fly-status';
import { StickyHeader } from '@/components/main/shared/sticky-header';
import { StatusChip, MedicalLevelChip } from '@/components/main/shared/status-chip';
import { PairingDisplay } from '@/components/main/shared/pairing-display';
import { EssentialInfoSection } from './essential-info-section';
import { ContactInfoSection } from './contact-info-section';
import { AdditionalDetailsSection } from './additional-details-section';
import { GuardianPairingDialog } from './guardian-pairing-dialog';
import { useNavigationBack } from '@/hooks/use-navigation-back';

const getStatusColor = (status) => {
  const colors = {
    'Active': 'success',
    'Flown': 'info',
    'Deceased': 'error',
    'Removed': 'error',
    'Future-Spring': 'warning',
    'Future-Fall': 'warning'
  };
  return colors[status] || 'default';
};

const getMedicalLevelColor = (level) => {
  const colors = {
    'A': 'success',
    'B': 'info',
    'C': 'warning',
    'D': 'error'
  };
  return colors[level] || 'default';
};


export function GuardianEditForm({ guardian, onNavigationReady, onNavigate }) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [guardianRev, setGuardianRev] = React.useState(guardian._rev || '');
  
  // History dialog state
  const [historyDialogOpen, setHistoryDialogOpen] = React.useState(false);
  const [historyDialogData, setHistoryDialogData] = React.useState({ title: '', history: [] });
  
  // Pairing management dialog state
  const [pairingDialogOpen, setPairingDialogOpen] = React.useState(false);
  
  // Scroll state for "Back to Top" link
  const [showBackToTop, setShowBackToTop] = React.useState(false);
  
  // Flight state
  const [flightOptions, setFlightOptions] = React.useState([]);
  
  // Ref for the veteran pairings section
  const veteranPairingsRef = React.useRef(null);
  
  // Handle scroll to show/hide "Back to Top" link
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 100;
      setShowBackToTop(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    // Check initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Load and build flight options
  React.useEffect(() => {
    const flights = getFlights();
    
    // Build flight options - include all flights but mark completed ones as disabled
    const options = [
      { label: 'No Flight', value: '', disabled: false },
      ...flights.map(flight => ({
        label: formatFlightNameForDisplay(flight.name),
        value: flight.name, // Save flight name (e.g., 'SSHF-Test01') as it comes from API
        disabled: flight.completed || false // Disable if flight is completed
      }))
    ];
    
    setFlightOptions(options);
  }, []);
  
  // Helper function to open history dialog
  const handleOpenHistory = React.useCallback((title, history) => {
    setHistoryDialogData({ title, history: history || [] });
    setHistoryDialogOpen(true);
  }, []);
  
  // Helper function to close history dialog
  const handleCloseHistory = React.useCallback(() => {
    setHistoryDialogOpen(false);
  }, []);
  
  // Use shared navigation back hook
  const baseHandleGoBack = useNavigationBack();
  
  // Use the navigation handler from parent if provided, otherwise use base
  // Note: We keep a reference to baseHandleGoBack for use after successful save
  const handleGoBack = onNavigate || baseHandleGoBack;

  // Update _rev when guardian prop changes
  React.useEffect(() => {
    if (guardian._rev) {
      setGuardianRev(guardian._rev);
    }
  }, [guardian._rev]);


  // Default values based on API structure
  const defaultValues = React.useMemo(() => ({
    _id: guardian._id || '',
    name: guardian.name || { first: '', middle: '', last: '', nickname: '' },
    address: guardian.address || { 
      street: '', 
      city: '', 
      county: '', 
      state: '', 
      zip: '', 
      phone_day: '', 
      phone_mbl: '', 
      email: '' 
    },
    birth_date: guardian.birth_date || '',
    gender: guardian.gender || '',
    occupation: guardian.occupation || '',
    app_date: guardian.app_date || '',
    notes: guardian.notes || { service: 'N', other: '' },
    medical: guardian.medical || { 
      level: '', 
      food_restriction: 'None', 
      can_push: false, 
      can_lift: false,
      limitations: '',
      experience: '',
      release: false,
      form: false
    },
    flight: guardian.flight || { 
      status: 'Active', 
      id: '', 
      group: '', 
      bus: '', 
      seat: '', 
      waiver: false, 
      vaccinated: false,
      training: 'None',
      training_complete: false,
      training_see_doc: false,
      training_notes: '',
      status_note: '',
      mediaWaiver: false,
      infection_test: false,
      nofly: false,
      booksOrdered: 0,
      confirmed_date: '',
      confirmed_by: '',
      paid: false,
      exempt: false
    },
    call: guardian.call || {
      assigned_to: '',
      notes: '',
      email_sent: false
    },
    emerg_contact: guardian.emerg_contact || { 
      name: '', 
      relation: '', 
      address: { 
        phone: '', 
        email: '' 
      } 
    },
    veteran: guardian.veteran || { 
      pref_notes: '',
      pairings: []
    },
    shirt: guardian.shirt || { size: 'None' },
    apparel: guardian.apparel || { 
      item: 'None',
      jacket_size: 'None', 
      shirt_size: 'None',
      delivery: 'None',
      date: '',
      by: '',
      notes: ''
    },
    accommodations: guardian.accommodations || { 
      hotel_name: '', 
      room_type: 'None', 
      arrival_date: '', 
      departure_date: '',
      arrival_time: '',
      arrival_flight: '',
      attend_banquette: false,
      banquette_guest: '',
      departure_time: '',
      departure_flight: '',
      notes: '' 
    },
    metadata: guardian.metadata || {
      created_at: '',
      created_by: '',
      updated_at: '',
      updated_by: ''
    }
  }), [guardian]);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    reset,
  } = useForm({
    defaultValues,
    // Removed zodResolver for simplicity
  });

  // Expose isDirty to parent component for unsaved changes detection
  React.useEffect(() => {
    if (onNavigationReady) {
      onNavigationReady({
        isDirty,
      });
    }
  }, [isDirty, onNavigationReady]);

  // Handle session storage veteranId for auto-opening dialog
  const hasAutoOpenedRef = React.useRef(false);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const veteranId = sessionStorage.getItem('pairingVeteranId');
    if (veteranId && !pairingDialogOpen && !hasAutoOpenedRef.current) {
      // Mark that we're processing this veteranId to prevent duplicate runs
      hasAutoOpenedRef.current = true;
      // Auto-open dialog - the dialog component will handle selecting the veteran
      setPairingDialogOpen(true);
    }
  }, [pairingDialogOpen]);

  // Handle applying pairings from dialog
  const handleApplyPairings = React.useCallback((selectedVeterans) => {
    setValue('veteran.pairings', selectedVeterans);
    // No toast notification - changes will be saved when user clicks Save Changes
  }, [setValue]);

  const onSubmit = React.useCallback(
    async (data) => {
      try {
        setSaving(true);
        
        // Create clean payload with required fields
        const payload = {
          ...data,
          _rev: guardianRev,
          type: 'Guardian'
        };
        
        // Remove metadata (API handles this)
        delete payload.metadata;
        
        // Remove history arrays from nested objects
        if (payload.flight?.history) delete payload.flight.history;
        if (payload.veteran?.history) delete payload.veteran.history;
        if (payload.call?.history) delete payload.call.history;
        
        const updatedGuardian = await api.updateGuardian(data._id, payload);
        toast.success('Guardian updated successfully');
        
        // Reset form state to mark as clean - this clears the dirty bit
        reset(updatedGuardian);
        
        // Stay on the current screen after save
      } catch (err) {
        logger.error(err);
        toast.error('Failed to update guardian: ' + (err.message || 'Unknown error'));
      } finally {
        setSaving(false);
      }
    },
    [router, guardianRev, handleGoBack]
  );

  const watchStatus = watch('flight.status');
  const watchTraining = watch('flight.training');
  const watchMedicalLevel = watch('medical.level');
  
  // Determine if form should be disabled (Flown status only for guardians)
  const isFormDisabled = watchStatus === 'Flown';

  // Scroll to section handler
  const handleScrollToSection = React.useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const nickname = watch('name.nickname') || guardian.name?.nickname;
  const fullName = nickname 
    ? nickname 
    : `${watch('name.first') || ''} ${watch('name.last') || ''}`.trim() || `${guardian.name?.first || ''} ${guardian.name?.last || ''}`.trim();
  const displayName = nickname 
    ? `${watch('name.first') || guardian.name?.first || ''} ${watch('name.last') || guardian.name?.last || ''}`.trim()
    : null;
  const additionalInfo = null;

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)}
      style={{ paddingBottom: '80px' }}
    >
      <StickyHeader
        name={fullName}
        nickname={nickname}
        fullName={displayName}
        status={watchStatus || guardian.flight?.status}
        statusColor={getStatusColor(watchStatus || guardian.flight?.status)}
        additionalInfo={additionalInfo}
        type="guardian"
      />
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 4, md: 2 }, width: '100%', alignItems: 'stretch' }}>
        <Box sx={{ width: { xs: '100%', md: '50%' }, flexShrink: 0, display: 'flex' }}>
          <Card 
            id="guardian-info"
            sx={{
              position: 'sticky',
              top: 24,
              backgroundColor: 'background.neutral',
              boxShadow: (theme) => theme.shadows[8],
              width: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <CardContent>
              <Stack spacing={3}>
                {/* Mobile: Person icon at top */}
                <Box
                  sx={{
                    height: '200px',
                    width: '100%',
                    backgroundColor: 'primary.lighter',
                    borderRadius: 2,
                    display: { xs: 'flex', md: 'none' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: (theme) => theme.shadows[4]
                  }}
                >
                  <Person 
                    size={120}
                    weight="duotone"
                    color="#ff9999"
                  />
                </Box>
                <Stack spacing={2}>
                  <Stack 
                    direction="row" 
                    spacing={2} 
                    alignItems="center" 
                    justifyContent="space-between"
                  >
                    <Stack spacing={0.5}>
                      {watch('name.nickname') || guardian.name?.nickname ? (
                        <>
                          <Typography 
                            variant="h4"
                            sx={{
                              fontWeight: 'bold',
                              color: 'primary.main'
                            }}
                          >
                            {watch('name.nickname') || guardian.name?.nickname}
                          </Typography>
                          <Typography 
                            variant="body2"
                            sx={{
                              color: 'text.secondary',
                              fontStyle: 'italic'
                            }}
                          >
                            {watch('name.first') || guardian.name?.first} {watch('name.last') || guardian.name?.last}
                          </Typography>
                        </>
                      ) : (
                        <Typography 
                          variant="h4"
                          sx={{
                            fontWeight: 'bold',
                            color: 'text.primary'
                          }}
                        >
                          {watch('name.first') || guardian.name?.first} {watch('name.last') || guardian.name?.last}
                        </Typography>
                      )}
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <StatusChip status={watchStatus || 'No Status'} getStatusColor={getStatusColor} />
                      <MedicalLevelChip level={watchMedicalLevel} getMedicalLevelColor={getMedicalLevelColor} />
                    </Stack>
                  </Stack>
                  <Divider />
                  {/* Mobile: Single column info (below name) */}
                  <Stack spacing={2} sx={{ display: { xs: 'block', md: 'none' } }}>
                    <Typography variant="body2">
                      {watchTraining ? `Training: ${watchTraining}` : 'No Training Completed'}
                    </Typography>
                    <Divider />
                    {/* Veteran Pairings Display - Mobile */}
                    <PairingDisplay
                      pairings={watch('veteran.pairings') || guardian.veteran?.pairings || []}
                      type="veteran"
                      onManageClick={isFormDisabled ? undefined : () => setPairingDialogOpen(true)}
                    />
                  </Stack>
                  {/* Desktop/Tablet: Two-column layout (icon left, training info right) */}
                  <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
                    <Box sx={{ flex: '2 1 0%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box
                        sx={{
                          height: '200px',
                          width: '200px',
                          backgroundColor: 'primary.lighter',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          boxShadow: (theme) => theme.shadows[4]
                        }}
                      >
                        <Person 
                          size={120}
                          weight="duotone"
                          color="#ff9999"
                        />
                      </Box>
                      <Stack spacing={1} sx={{ mt: 2, alignItems: 'center', textAlign: 'center' }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 'medium'
                          }}
                        >
                          Guardian
                        </Typography>
                      </Stack>
                    </Box>
                    <Box sx={{ flex: '1 1 0%' }}>
                      <Stack spacing={2}>
                        <Typography variant="subtitle1">
                          {watchTraining ? `Training: ${watchTraining}` : 'No Training Completed'}
                        </Typography>
                        <Divider />
                        {/* Veteran Pairings Display - Desktop */}
                        <PairingDisplay
                          pairings={watch('veteran.pairings') || guardian.veteran?.pairings || []}
                          type="veteran"
                          onManageClick={isFormDisabled ? undefined : () => setPairingDialogOpen(true)}
                        />
                        <Divider />
                        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                          <Controller
                            control={control}
                            name="app_date"
                            render={({ field }) => (
                              <FormControl error={Boolean(errors.app_date)} fullWidth disabled={isFormDisabled}>
                                <InputLabel>Application Date</InputLabel>
                                <OutlinedInput {...field} type="date" />
                                {errors.app_date ? <FormHelperText>{errors.app_date.message}</FormHelperText> : null}
                              </FormControl>
                            )}
                          />
                        </Box>
                      </Stack>
                    </Box>
                  </Box>
                </Stack>
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                  <Divider sx={{ my: 2 }} />
                  <Controller
                    control={control}
                    name="app_date"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.app_date)} fullWidth disabled={isFormDisabled}>
                        <InputLabel>Application Date</InputLabel>
                        <OutlinedInput {...field} type="date" />
                        {errors.app_date ? <FormHelperText>{errors.app_date.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ width: { xs: '100%', md: '50%' }, flexShrink: 0, pr: { md: 3 }, ml: { md: 0 }, display: 'flex' }}>
          <Box sx={{ width: '100%', display: 'flex' }}>
            <GoodToFlyStatus data={watch()} type="guardian" onScrollToSection={handleScrollToSection} />
          </Box>
        </Box>
      </Box>
      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid xs={12} md={12}>
          <Stack spacing={4}>
            {/* Essential Information Group */}
            <EssentialInfoSection
              control={control}
              errors={errors}
              guardian={guardian}
              onOpenHistory={handleOpenHistory}
              flightOptions={flightOptions}
              disabled={isFormDisabled}
            />

            {/* Contact Information Group */}
            <ContactInfoSection
              control={control}
              errors={errors}
              guardian={guardian}
              veteranPairingsRef={veteranPairingsRef}
              onManagePairing={() => setPairingDialogOpen(true)}
              watch={watch}
              disabled={isFormDisabled}
            />

            {/* Additional Details Group */}
            <AdditionalDetailsSection
              control={control}
              errors={errors}
              disabled={isFormDisabled}
            />
          </Stack>
        </Grid>
      </Grid>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: { xs: 0, lg: 'var(--SideNav-width)' },
          right: 0,
          padding: 2,
          backgroundColor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          zIndex: 1000,
          backdropFilter: 'blur(20px)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 2
        }}
      >
        {showBackToTop && (
          <Box
            component="button"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'text.secondary',
              textDecoration: 'none',
              fontSize: '0.875rem',
              cursor: 'pointer',
              marginRight: 'auto',
              background: 'none',
              border: 'none',
              padding: 0,
              font: 'inherit',
              '&:hover': {
                color: 'primary.main',
                textDecoration: 'underline'
              }
            }}
          >
            <ArrowUp size={16} />
            Back to Top
          </Box>
        )}
        <Stack direction="row" spacing={2}>
          <Button 
            color="inherit" 
            onClick={handleGoBack}
            sx={{
              borderRadius: 2,
              fontWeight: 'medium'
            }}
          >
            Cancel
          </Button>
          <Tooltip 
            title={isFormDisabled ? "Cannot edit records with 'Flown' status" : ""}
            placement="top"
          >
            <span>
              <Button 
                type="submit" 
                variant="contained"
                disabled={saving || isFormDisabled}
                sx={{
                  borderRadius: 2,
                  fontWeight: 'medium',
                  boxShadow: (theme) => theme.shadows[4]
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Box>
      <HistoryDialog
        open={historyDialogOpen}
        onClose={handleCloseHistory}
        history={historyDialogData.history}
        title={historyDialogData.title}
      />
      <GuardianPairingDialog
        open={pairingDialogOpen}
        onClose={() => setPairingDialogOpen(false)}
        onApply={handleApplyPairings}
        currentPairings={watch('veteran.pairings') || guardian.veteran?.pairings || []}
        preferenceNotes={watch('veteran.pref_notes') || guardian.veteran?.pref_notes || ''}
      />
    </form>
  );
}
