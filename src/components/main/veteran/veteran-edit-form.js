'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Image from 'next/image';
import { Controller, useForm } from 'react-hook-form';
import Chip from '@mui/material/Chip';
import { 
  Medal,
  Users,
  X,
  ArrowUp
} from '@phosphor-icons/react';

import { paths } from '@/paths';
import { logger } from '@/lib/default-logger';
import { toast } from '@/components/core/toaster';
import { api } from '@/lib/api';
import { HistoryDialog } from '@/components/core/history-dialog';
import { GoodToFlyStatus } from '@/components/main/shared/good-to-fly-status';
import { StickyHeader } from '@/components/main/shared/sticky-header';
import { StatusChip, MedicalLevelChip } from '@/components/main/shared/status-chip';
import { PairingDisplay } from '@/components/main/shared/pairing-display';
import { EssentialInfoSection } from './essential-info-section';
import { ContactInfoSection } from './contact-info-section';
import { AdditionalDetailsSection } from './additional-details-section';
import { useNavigationBack } from '@/hooks/use-navigation-back';
import { pushNavigationEntry } from '@/lib/navigation-stack';

const getBranchImage = (branch) => {
  const images = {
    'Air Force': '/assets/AirForce.png',
    'Army': '/assets/Army.png',
    'Coast Guard': '/assets/CoastGuard.png',
    'Marines': '/assets/Marines.png',
    'Navy': '/assets/Navy.png'
  };
  return images[branch] || '';
};

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
  const levelStr = String(level);
  const colors = {
    '1': 'success',
    '2': 'warning',
    '2.5': 'warning',
    '3': 'error'
  };
  return colors[levelStr] || 'default';
};


export function VeteranEditForm({ veteran, onNavigationReady, onNavigate }) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [veteranRev, setVeteranRev] = React.useState(veteran._rev || '');
  
  // History dialog state
  const [historyDialogOpen, setHistoryDialogOpen] = React.useState(false);
  const [historyDialogData, setHistoryDialogData] = React.useState({ title: '', history: [] });
  
  // Pairing management dialog state
  const [pairingDialogOpen, setPairingDialogOpen] = React.useState(false);
  
  // Scroll state for "Back to Top" link
  const [showBackToTop, setShowBackToTop] = React.useState(false);
  
  // Ref for the guardian pairing section
  const guardianPairingRef = React.useRef(null);
  
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
  const baseHandleGoBack = useNavigationBack({
    scrollConfig: {
      fromPage: 'guardian-details',
      toSection: 'veteran-pairings'
    }
  });
  
  // Use the navigation handler from parent if provided, otherwise use base
  // Note: We keep a reference to baseHandleGoBack for use after successful save
  const handleGoBack = onNavigate || baseHandleGoBack;

  // Update _rev when veteran prop changes
  React.useEffect(() => {
    if (veteran._rev) {
      setVeteranRev(veteran._rev);
    }
  }, [veteran._rev]);
  

  // Default values based on API structure
  const defaultValues = React.useMemo(() => ({
    _id: veteran._id || '',
    name: veteran.name || { first: '', middle: '', last: '', nickname: '' },
    address: veteran.address || { street: '', city: '', state: '', zip: '', phone_day: '', phone_mbl: '', email: '' },
    service: veteran.service || { branch: '', rank: '', dates: '', activity: '' },
    vet_type: veteran.vet_type || '',
    birth_date: veteran.birth_date || '',
    gender: veteran.gender || '',
    app_date: veteran.app_date || '',
    medical: veteran.medical || { 
      level: '', 
      alt_level: '', 
      food_restriction: 'None', 
      limitations: '',
      review: '',
      usesCane: false, 
      usesWalker: false,
      usesWheelchair: false,
      usesScooter: false,
      isWheelchairBound: false,
      requiresOxygen: false,
      examRequired: false,
      release: false,
      form: false
    },
    flight: veteran.flight || { 
      status: 'Active', 
      group: '', 
      bus: '', 
      seat: '', 
      waiver: false,
      status_note: '',
      confirmed_date: '',
      confirmed_by: '',
      mediaWaiver: false,
      vaccinated: false,
      infection_test: false,
      nofly: false
    },
    emerg_contact: veteran.emerg_contact || { 
      name: '', 
      relation: '', 
      address: { 
        phone: '', 
        phone_mbl: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zip: ''
      } 
    },
    alt_contact: veteran.alt_contact || { 
      name: '', 
      relation: '', 
      address: { 
        phone: '', 
        phone_mbl: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zip: ''
      } 
    },
    guardian: veteran.guardian || { name: '', id: '', pref_notes: '' },
    mail_call: veteran.mail_call || { 
      name: '', 
      relation: '', 
      notes: '', 
      received: false,
      adopt: false,
      address: { phone: '', email: '' }
    },
    call: veteran.call || {
      assigned_to: '',
      notes: '',
      mail_sent: false,
      email_sent: false
    },
    shirt: veteran.shirt || { size: '' },
    apparel: veteran.apparel || { 
      jacket_size: '', 
      delivery: 'None',
      item: '',
      shirt_size: '',
      date: '',
      by: '',
      notes: ''
    },
    media_newspaper_ok: veteran.media_newspaper_ok || 'No',
    media_interview_ok: veteran.media_interview_ok || 'No',
    accommodations: veteran.accommodations || { 
      hotel_name: '', 
      room_type: 'None', 
      arrival_date: '', 
      departure_date: '', 
      notes: '',
      arrival_time: '',
      arrival_flight: '',
      attend_banquette: false,
      banquette_guest: '',
      departure_time: '',
      departure_flight: ''
    },
    homecoming: veteran.homecoming || { destination: '' },
    metadata: veteran.metadata || {
      created_at: '',
      created_by: '',
      updated_at: '',
      updated_by: ''
    }
  }), [veteran]);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
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

  const onSubmit = React.useCallback(
    async (data) => {
      try {
        setSaving(true);
        
        // Create clean payload with required fields
        const payload = {
          ...data,
          _rev: veteranRev,
          type: 'Veteran'
        };
        
        // Remove metadata (API handles this)
        delete payload.metadata;
        
        // Remove history arrays from nested objects
        if (payload.flight?.history) delete payload.flight.history;
        if (payload.guardian?.history) delete payload.guardian.history;
        if (payload.call?.history) delete payload.call.history;
        
        const updatedVeteran = await api.updateVeteran(data._id, payload);
        toast.success('Veteran updated successfully');
        
        // Reset form state to mark as clean - this clears the dirty bit
        reset(updatedVeteran);
        
        // Stay on the current screen after save
      } catch (err) {
        logger.error(err);
        toast.error('Failed to update veteran: ' + (err.message || 'Unknown error'));
      } finally {
        setSaving(false);
      }
    },
    [router, veteranRev, handleGoBack]
  );

  const watchBranch = watch('service.branch');
  const watchRank = watch('service.rank');
  const watchDates = watch('service.dates');
  const watchVetType = watch('vet_type');
  const watchStatus = watch('flight.status');
  const watchMedicalLevel = watch('medical.level');

  // Scroll to section handler
  const handleScrollToSection = React.useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const nickname = watch('name.nickname') || veteran.name?.nickname;
  const fullName = nickname 
    ? nickname 
    : `${watch('name.first') || ''} ${watch('name.last') || ''}`.trim() || `${veteran.name?.first || ''} ${veteran.name?.last || ''}`.trim();
  const displayName = nickname 
    ? `${watch('name.first') || veteran.name?.first || ''} ${watch('name.last') || veteran.name?.last || ''}`.trim()
    : null;
  const additionalInfo = watchBranch ? `${watchBranch}${watchRank ? ` • ${watchRank}` : ''}` : null;

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)}
      style={{ paddingBottom: '80px' }}
    >
      <StickyHeader
        name={fullName}
        nickname={nickname}
        fullName={displayName}
        status={watchStatus || veteran.flight?.status}
        statusColor={getStatusColor(watchStatus || veteran.flight?.status)}
        additionalInfo={additionalInfo}
        type="veteran"
      />
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 4, md: 2 }, width: '100%', alignItems: 'stretch' }}>
        <Box sx={{ width: { xs: '100%', md: '50%' }, flexShrink: 0, display: 'flex' }}>
          <Card 
            id="veteran-info"
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
                {/* Mobile: Branch image at top */}
                {watchBranch ? (
                  <Box
                    sx={{
                      position: 'relative',
                      height: '200px',
                      width: '100%',
                      display: { xs: 'block', md: 'none' },
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: (theme) => theme.shadows[4],
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.02)'
                      }
                    }}
                  >
                    <Image
                      src={getBranchImage(watchBranch)}
                      alt={watchBranch}
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      height: '200px',
                      width: '100%',
                      display: { xs: 'flex', md: 'none' },
                      backgroundColor: 'var(--mui-palette-background-level2)',
                      borderRadius: 1,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography color="text.secondary">
                      Select a branch of service
                    </Typography>
                  </Box>
                )}
                <Stack spacing={2}>
                  <Stack 
                    direction="row" 
                    spacing={2} 
                    alignItems="center" 
                    justifyContent="space-between"
                  >
                    <Stack spacing={0.5}>
                      {watch('name.nickname') || veteran.name?.nickname ? (
                        <>
                          <Typography 
                            variant="h4"
                            sx={{
                              fontWeight: 'bold',
                              color: 'primary.main'
                            }}
                          >
                            {watch('name.nickname') || veteran.name?.nickname}
                          </Typography>
                          <Typography 
                            variant="body2"
                            sx={{
                              color: 'text.secondary',
                              fontStyle: 'italic'
                            }}
                          >
                            {watch('name.first') || veteran.name?.first} {watch('name.last') || veteran.name?.last}
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
                          {watch('name.first') || veteran.name?.first} {watch('name.last') || veteran.name?.last}
                        </Typography>
                      )}
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <StatusChip status={watchStatus || 'No Status'} getStatusColor={getStatusColor} />
                      <MedicalLevelChip level={watchMedicalLevel} getMedicalLevelColor={getMedicalLevelColor} />
                    </Stack>
                  </Stack>
                  <Divider />
                  {/* Mobile: Single column service info (below name) */}
                  <Stack spacing={2} sx={{ display: { xs: 'block', md: 'none' } }}>
                    <Typography 
                      variant="h6"
                      sx={{ 
                        fontWeight: 'medium' 
                      }}
                    >
                      {watchBranch || 'Branch Not Specified'}
                    </Typography>
                    <Typography variant="subtitle1">
                      {watchRank || 'Rank Not Specified'}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ color: 'text.secondary' }}
                    >
                      {watchDates || 'Service Dates Not Specified'}
                    </Typography>
                    <Chip
                      label={`${watchVetType || 'Unknown'} Era`}
                      variant="outlined"
                      size="small"
                      sx={{ alignSelf: 'flex-start' }}
                    />
                    <Divider />
                    {/* Guardian Pairing Display - Mobile */}
                    <PairingDisplay
                      singlePairing={watch('guardian.id') && watch('guardian.name') ? {
                        id: watch('guardian.id'),
                        name: watch('guardian.name')
                      } : null}
                      type="guardian"
                      onManageClick={undefined}
                    />
                  </Stack>
                  {/* Desktop/Tablet: Two-column layout (image left, service info right) */}
                  <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
                    <Box sx={{ flex: '2 1 0%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {watchBranch ? (
                        <Box
                          sx={{
                            position: 'relative',
                            height: '200px',
                            width: '200px',
                            borderRadius: 2,
                            overflow: 'hidden',
                            boxShadow: (theme) => theme.shadows[4],
                            transition: 'transform 0.3s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.02)'
                            }
                          }}
                        >
                          <Image
                            src={getBranchImage(watchBranch)}
                            alt={watchBranch}
                            fill
                            style={{ objectFit: 'contain' }}
                          />
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            height: '200px',
                            width: '100%',
                            backgroundColor: 'var(--mui-palette-background-level2)',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography color="text.secondary">
                            Select a branch of service
                          </Typography>
                        </Box>
                      )}
                      <Stack spacing={1} sx={{ mt: 2, alignItems: 'center', textAlign: 'center' }}>
                        <Typography 
                          variant="h6"
                          sx={{ 
                            fontWeight: 'medium' 
                          }}
                        >
                          {watchBranch || 'Branch Not Specified'}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box sx={{ flex: '1 1 0%' }}>
                      <Stack spacing={2}>
                        <Typography variant="subtitle1">
                          {watchRank || 'Rank Not Specified'}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.secondary' }}
                        >
                          {watchDates || 'Service Dates Not Specified'}
                        </Typography>
                        <Chip
                          label={`${watchVetType || 'Unknown'} Era`}
                          variant="outlined"
                          size="small"
                          sx={{ alignSelf: 'flex-start' }}
                        />
                        <Divider />
                        {/* Guardian Pairing Display */}
                        <PairingDisplay
                          singlePairing={watch('guardian.id') && watch('guardian.name') ? {
                            id: watch('guardian.id'),
                            name: watch('guardian.name')
                          } : null}
                          type="guardian"
                          onManageClick={undefined}
                        />
                        <Divider />
                        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                          <Controller
                            control={control}
                            name="app_date"
                            render={({ field }) => (
                              <FormControl error={Boolean(errors.app_date)} fullWidth>
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
                      <FormControl error={Boolean(errors.app_date)} fullWidth>
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
            <GoodToFlyStatus data={watch()} type="veteran" onScrollToSection={handleScrollToSection} />
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
              veteran={veteran}
              onOpenHistory={handleOpenHistory}
            />

            {/* Contact Information Group */}
            <ContactInfoSection
              control={control}
              errors={errors}
              veteran={veteran}
              onOpenHistory={handleOpenHistory}
              guardianPairingRef={guardianPairingRef}
              onManagePairing={undefined}
              watch={watch}
            />

            {/* Additional Details Group */}
            <AdditionalDetailsSection
              control={control}
              errors={errors}
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
          <Button 
            type="submit" 
            variant="contained"
            disabled={saving}
            sx={{
              borderRadius: 2,
              fontWeight: 'medium',
              boxShadow: (theme) => theme.shadows[4]
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Stack>
      </Box>
      <HistoryDialog 
        open={historyDialogOpen}
        onClose={handleCloseHistory}
        history={historyDialogData.history}
        title={historyDialogData.title}
      />
      <Dialog
        open={pairingDialogOpen}
        onClose={() => setPairingDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            fontWeight: 'bold',
            fontSize: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Users size={24} weight="bold" />
            Guardian Pairing Management
          </Box>
          <Box
            component="button"
            onClick={() => setPairingDialogOpen(false)}
            sx={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary'
              },
              transition: 'color 0.2s'
            }}
            aria-label="Close"
          >
            <X size={24} weight="bold" />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              Coming Soon
            </Typography>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 'medium' }}>
                Guardian Preference Notes:
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'background.neutral', 
                  borderRadius: 1,
                  minHeight: 100,
                  whiteSpace: 'pre-wrap'
                }}
              >
                {watch('guardian.pref_notes') || veteran.guardian?.pref_notes || 'No preference notes entered.'}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>
    </form>
  );
}