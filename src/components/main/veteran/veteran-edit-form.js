'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Image from 'next/image';
import { Controller, useForm } from 'react-hook-form';
import Chip from '@mui/material/Chip';
import { 
  User, 
  Medal,
  Airplane,
  Phone,
  Users,
  EnvelopeSimple,
  TShirt,
  Camera,
  Calendar,
  FirstAid,
  House,
  Clock,
  Headset,
  Eye,
  HistoryIcon,
  X,
  Gear,
  ArrowUp,
  LinkBreak
} from '@phosphor-icons/react';

import { paths } from '@/paths';
import { logger } from '@/lib/default-logger';
import { Option } from '@/components/core/option';
import { toast } from '@/components/core/toaster';
import { api } from '@/lib/api';
import { HistoryDialog } from '@/components/core/history-dialog';
import { GoodToFlyStatus } from '@/components/main/shared/good-to-fly-status';
import { StickyHeader } from '@/components/main/shared/sticky-header';
import { useNavigationBack } from '@/hooks/use-navigation-back';

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

// Add new component for section headers
const SectionHeader = ({ icon: Icon, title }) => (
  <Stack 
    direction="row" 
    alignItems="center" 
    spacing={2}
    sx={{ mb: 3 }}
  >
    <Box
      sx={{
        backgroundColor: 'primary.main',
        width: 4,
        height: 24,
        borderRadius: 1
      }}
    />
    <Stack direction="row" spacing={1} alignItems="center">
      {Icon && (
        <Icon 
          size={24}
          weight="bold" 
          color="var(--mui-palette-primary-main)"
        />
      )}
      <Typography 
        variant="h6"
        sx={{ fontWeight: 'bold' }}
      >
        {title}
      </Typography>
    </Stack>
  </Stack>
);

export function VeteranEditForm({ veteran }) {
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
  const handleGoBack = useNavigationBack({
    scrollConfig: {
      fromPage: 'guardian-details',
      toSection: 'veteran-pairings'
    }
  });

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
    formState: { errors },
    watch,
  } = useForm({
    defaultValues,
    // Removed zodResolver for simplicity
  });

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
        
        await api.updateVeteran(data._id, payload);
        toast.success('Veteran updated successfully');
        handleGoBack();
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
                      <Chip
                        label={watchStatus || 'No Status'}
                        color={getStatusColor(watchStatus)}
                        size="small"
                        sx={{
                          borderRadius: 1,
                          fontWeight: 'medium'
                        }}
                      />
                      {watchMedicalLevel && (
                        <Chip
                          label={`Medical Level: ${watchMedicalLevel}`}
                          color={getMedicalLevelColor(watchMedicalLevel)}
                          size="small"
                          sx={{
                            borderRadius: 1,
                            fontWeight: 'medium'
                          }}
                        />
                      )}
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
                    {watch('guardian.id') && watch('guardian.name') ? (
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Paired Guardian
                          </Typography>
                          <Tooltip title="Manage Pairings" arrow placement="top">
                            <IconButton
                              size="small"
                              onClick={() => setPairingDialogOpen(true)}
                              sx={{
                                color: 'text.secondary',
                                '&:hover': {
                                  color: 'primary.main',
                                  backgroundColor: 'action.hover'
                                }
                              }}
                            >
                              <Gear size={16} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                        <Card
                          variant="outlined"
                          onClick={() => {
                            sessionStorage.setItem('previousPage', 'veteran-details');
                            router.push(paths.main.guardians.details(watch('guardian.id')));
                          }}
                          sx={{
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              boxShadow: 2,
                              borderColor: 'primary.main'
                            }
                          }}
                        >
                          <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                              <Typography variant="body2" color="text.primary">
                                {watch('guardian.name')}
                              </Typography>
                              <Eye size={16} color="var(--mui-palette-primary-main)" />
                            </Stack>
                          </CardContent>
                        </Card>
                      </Box>
                    ) : (
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LinkBreak size={16} color="var(--mui-palette-warning-main)" />
                            <Typography variant="caption" color="text.secondary">
                              No Guardian Paired
                            </Typography>
                          </Stack>
                          <Tooltip title="Manage Pairings" arrow placement="top">
                            <IconButton
                              size="small"
                              onClick={() => setPairingDialogOpen(true)}
                              sx={{
                                color: 'text.secondary',
                                '&:hover': {
                                  color: 'primary.main',
                                  backgroundColor: 'action.hover'
                                }
                              }}
                            >
                              <Gear size={16} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Box>
                    )}
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
                        {watch('guardian.id') && watch('guardian.name') ? (
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Paired Guardian
                              </Typography>
                              <Tooltip title="Manage Pairings" arrow placement="top">
                                <IconButton
                                  size="small"
                                  onClick={() => setPairingDialogOpen(true)}
                                  sx={{
                                    color: 'text.secondary',
                                    '&:hover': {
                                      color: 'primary.main',
                                      backgroundColor: 'action.hover'
                                    }
                                  }}
                                >
                                  <Gear size={16} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                            <Card
                              variant="outlined"
                              onClick={() => {
                                sessionStorage.setItem('previousPage', 'veteran-details');
                                router.push(paths.main.guardians.details(watch('guardian.id')));
                              }}
                              sx={{
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  boxShadow: 2,
                                  borderColor: 'primary.main'
                                }
                              }}
                            >
                              <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                                  <Typography variant="body2" color="text.primary">
                                    {watch('guardian.name')}
                                  </Typography>
                                  <Eye size={16} color="var(--mui-palette-primary-main)" />
                                </Stack>
                              </CardContent>
                            </Card>
                          </Box>
                        ) : (
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <LinkBreak size={16} color="var(--mui-palette-warning-main)" />
                                <Typography variant="caption" color="text.secondary">
                                  No Guardian Paired
                                </Typography>
                              </Stack>
                              <Tooltip title="Manage Pairings" arrow placement="top">
                                <IconButton
                                  size="small"
                                  onClick={() => setPairingDialogOpen(true)}
                                  sx={{
                                    color: 'text.secondary',
                                    '&:hover': {
                                      color: 'primary.main',
                                      backgroundColor: 'action.hover'
                                    }
                                  }}
                                >
                                  <Gear size={16} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Box>
                        )}
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
            <Stack spacing={3}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.main',
                  px: 2 
                }}
              >
                Essential Information
              </Typography>
              
              {/* Personal Information Card */}
              <Card
                elevation={2}
                sx={{
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent>
                  <SectionHeader 
                    icon={User} 
                    title="Personal Information" 
                  />
                  <Grid container spacing={3}>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="name.first"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.name?.first)} fullWidth>
                            <InputLabel required>First Name</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.name?.first ? <FormHelperText>{errors.name.first.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="name.middle"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.name?.middle)} fullWidth>
                            <InputLabel>Middle Name</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.name?.middle ? <FormHelperText>{errors.name.middle.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="name.last"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.name?.last)} fullWidth>
                            <InputLabel required>Last Name</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.name?.last ? <FormHelperText>{errors.name.last.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="name.nickname"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.name?.nickname)} fullWidth>
                            <InputLabel>Nickname</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.name?.nickname ? <FormHelperText>{errors.name.nickname.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="birth_date"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.birth_date)} fullWidth>
                            <InputLabel required>Birth Date</InputLabel>
                            <OutlinedInput {...field} type="date" />
                            {errors.birth_date ? <FormHelperText>{errors.birth_date.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="gender"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.gender)} fullWidth>
                            <InputLabel required>Gender</InputLabel>
                            <Select {...field}>
                              <Option value="M">Male</Option>
                              <Option value="F">Female</Option>
                            </Select>
                            {errors.gender ? <FormHelperText>{errors.gender.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Service Information Card */}
              <Card elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent>
                  <SectionHeader 
                    icon={Medal} 
                    title="Service Information" 
                  />
                  <Grid container spacing={3}>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="service.branch"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.service?.branch)} fullWidth>
                            <InputLabel required>Branch</InputLabel>
                            <Select {...field}>
                              <Option value="">Select a branch</Option>
                              <Option value="Army">Army</Option>
                              <Option value="Air Force">Air Force</Option>
                              <Option value="Navy">Navy</Option>
                              <Option value="Marines">Marines</Option>
                              <Option value="Coast Guard">Coast Guard</Option>
                            </Select>
                            {errors.service?.branch ? <FormHelperText>{errors.service.branch.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="service.rank"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.service?.rank)} fullWidth>
                            <InputLabel required>Rank</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.service?.rank ? <FormHelperText>{errors.service.rank.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="service.dates"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.service?.dates)} fullWidth>
                            <InputLabel required>Service Dates</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.service?.dates ? <FormHelperText>{errors.service.dates.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="vet_type"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.vet_type)} fullWidth>
                            <InputLabel required>War Era</InputLabel>
                            <Select {...field}>
                              <Option value="">Select war era</Option>
                              <Option value="WWII">WWII</Option>
                              <Option value="Korea">Korea</Option>
                              <Option value="Vietnam">Vietnam</Option>
                              <Option value="Afghanistan">Afghanistan</Option>
                              <Option value="Iraq">Iraq</Option>
                              <Option value="Other">Other</Option>
                            </Select>
                            {errors.vet_type ? <FormHelperText>{errors.vet_type.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <Controller
                        control={control}
                        name="service.activity"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.service?.activity)} fullWidth>
                            <InputLabel>Activities During Military Service</InputLabel>
                            <OutlinedInput {...field} multiline rows={3} />
                            {errors.service?.activity ? <FormHelperText>{errors.service.activity.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Medical Information Card */}
              <Card id="medical-section" elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent>
                  <SectionHeader 
                    icon={FirstAid} 
                    title="Medical Information" 
                  />
                  <Grid container spacing={3}>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="medical.level"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.medical?.level)} fullWidth>
                            <InputLabel>Medical Level</InputLabel>
                            <OutlinedInput {...field} inputProps={{ maxLength: 3 }} />
                            {errors.medical?.level ? <FormHelperText>{errors.medical.level.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="medical.alt_level"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.medical?.alt_level)} fullWidth>
                            <InputLabel>3rd-Party Level</InputLabel>
                            <OutlinedInput {...field} inputProps={{ maxLength: 3 }} />
                            {errors.medical?.alt_level ? <FormHelperText>{errors.medical.alt_level.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="medical.food_restriction"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.medical?.food_restriction)} fullWidth>
                            <InputLabel>Food Restriction</InputLabel>
                            <Select {...field}>
                              <Option value="None">None</Option>
                              <Option value="Gluten Free">Gluten Free</Option>
                              <Option value="Vegetarian">Vegetarian</Option>
                              <Option value="Vegan">Vegan</Option>
                            </Select>
                            {errors.medical?.food_restriction ? <FormHelperText>{errors.medical.food_restriction.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'medium' }}>
                        Mobility Equipment Used:
                      </Typography>
                      <Stack direction="row" spacing={2} flexWrap="wrap">
                        <FormControlLabel
                          control={
                            <Controller
                              control={control}
                              name="medical.usesCane"
                              render={({ field }) => (
                                <Checkbox {...field} checked={field.value} />
                              )}
                            />
                          }
                          label="Cane"
                        />
                        <FormControlLabel
                          control={
                            <Controller
                              control={control}
                              name="medical.usesWalker"
                              render={({ field }) => (
                                <Checkbox {...field} checked={field.value} />
                              )}
                            />
                          }
                          label="Walker"
                        />
                        <FormControlLabel
                          control={
                            <Controller
                              control={control}
                              name="medical.usesWheelchair"
                              render={({ field }) => (
                                <Checkbox {...field} checked={field.value} />
                              )}
                            />
                          }
                          label="Wheelchair"
                        />
                        <FormControlLabel
                          control={
                            <Controller
                              control={control}
                              name="medical.usesScooter"
                              render={({ field }) => (
                                <Checkbox {...field} checked={field.value} />
                              )}
                            />
                          }
                          label="Scooter"
                        />
                      </Stack>
                    </Grid>
                    <Grid xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Controller
                            control={control}
                            name="medical.isWheelchairBound"
                            render={({ field }) => (
                              <Checkbox {...field} checked={field.value} />
                            )}
                          />
                        }
                        label="Wheelchair Bound (unable to transfer)"
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Controller
                            control={control}
                            name="medical.requiresOxygen"
                            render={({ field }) => (
                              <Checkbox {...field} checked={field.value} />
                            )}
                          />
                        }
                        label="Requires Oxygen"
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Controller
                            control={control}
                            name="medical.examRequired"
                            render={({ field }) => (
                              <Checkbox {...field} checked={field.value} />
                            )}
                          />
                        }
                        label="Medical Exam Required"
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Controller
                            control={control}
                            name="medical.release"
                            render={({ field }) => (
                              <Checkbox {...field} checked={field.value} />
                            )}
                          />
                        }
                        label="Medical Waiver Received"
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Controller
                            control={control}
                            name="medical.form"
                            render={({ field }) => (
                              <Checkbox {...field} checked={field.value} />
                            )}
                          />
                        }
                        label="Medical Form Received"
                      />
                    </Grid>
                    <Grid xs={12}>
                      <Controller
                        control={control}
                        name="medical.review"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.medical?.review)} fullWidth>
                            <InputLabel>Medical Notes</InputLabel>
                            <OutlinedInput {...field} multiline rows={3} />
                            {errors.medical?.review ? <FormHelperText>{errors.medical.review.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    {/* Hidden field for medical limitations */}
                    <Controller
                      control={control}
                      name="medical.limitations"
                      render={({ field }) => (
                        <input type="hidden" {...field} />
                      )}
                    />
                  </Grid>
                </CardContent>
              </Card>

              {/* Flight Status Card */}
              <Card id="flight-section" elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                    <SectionHeader 
                      icon={Airplane} 
                      title="Flight Status" 
                    />
                    <Button
                      startIcon={<Clock size={18} weight="bold" />}
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenHistory('Flight Status', veteran.flight?.history || [])}
                      sx={{
                        borderRadius: 1,
                        textTransform: 'none',
                        fontWeight: 'medium'
                      }}
                    >
                      History ({veteran.flight?.history?.length || 0})
                    </Button>
                  </Stack>
                  <Grid container spacing={3}>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="flight.status"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.flight?.status)} fullWidth>
                            <InputLabel required>Status</InputLabel>
                            <Select {...field}>
                              <Option value="Active">Active</Option>
                              <Option value="Flown">Flown</Option>
                              <Option value="Deceased">Deceased</Option>
                              <Option value="Removed">Removed</Option>
                              <Option value="Future-Spring">Future-Spring</Option>
                              <Option value="Future-Fall">Future-Fall</Option>
                              <Option value="Future-PostRestriction">Future-PostRestriction</Option>
                            </Select>
                            {errors.flight?.status ? <FormHelperText>{errors.flight.status.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="flight.group"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.flight?.group)} fullWidth>
                            <InputLabel>Flight Group</InputLabel>
                            <OutlinedInput {...field} inputProps={{ maxLength: 15 }} />
                            {errors.flight?.group ? <FormHelperText>{errors.flight.group.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="flight.id"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.flight?.id)} fullWidth>
                            <InputLabel>Assigned Flight</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.flight?.id ? <FormHelperText>{errors.flight.id.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="flight.seat"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.flight?.seat)} fullWidth>
                            <InputLabel>Assigned Seat</InputLabel>
                            <OutlinedInput {...field} inputProps={{ maxLength: 10 }} />
                            {errors.flight?.seat ? <FormHelperText>{errors.flight.seat.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="flight.bus"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.flight?.bus)} fullWidth>
                            <InputLabel>Assigned Bus</InputLabel>
                            <Select {...field}>
                              <Option value="">None</Option>
                              <Option value="Alpha1">Alpha1</Option>
                              <Option value="Alpha2">Alpha2</Option>
                              <Option value="Alpha3">Alpha3</Option>
                              <Option value="Alpha4">Alpha4</Option>
                              <Option value="Alpha5">Alpha5</Option>
                              <Option value="Bravo1">Bravo1</Option>
                              <Option value="Bravo2">Bravo2</Option>
                              <Option value="Bravo3">Bravo3</Option>
                              <Option value="Bravo4">Bravo4</Option>
                              <Option value="Bravo5">Bravo5</Option>
                            </Select>
                            {errors.flight?.bus ? <FormHelperText>{errors.flight.bus.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="flight.confirmed_date"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.flight?.confirmed_date)} fullWidth>
                            <InputLabel>Confirmed Date</InputLabel>
                            <OutlinedInput {...field} type="date" />
                            {errors.flight?.confirmed_date ? <FormHelperText>{errors.flight.confirmed_date.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="flight.confirmed_by"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.flight?.confirmed_by)} fullWidth>
                            <InputLabel>Confirmed By</InputLabel>
                            <OutlinedInput {...field} inputProps={{ maxLength: 30 }} />
                            {errors.flight?.confirmed_by ? <FormHelperText>{errors.flight.confirmed_by.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <Controller
                        control={control}
                        name="flight.status_note"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.flight?.status_note)} fullWidth>
                            <InputLabel>Status Note</InputLabel>
                            <OutlinedInput {...field} multiline rows={3} />
                            {errors.flight?.status_note ? <FormHelperText>{errors.flight.status_note.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'medium' }}>
                        Flight Requirements:
                      </Typography>
                      <Stack direction="row" spacing={2} flexWrap="wrap">
                        <FormControlLabel
                          control={
                            <Controller
                              control={control}
                              name="flight.waiver"
                              render={({ field }) => (
                                <Checkbox {...field} checked={field.value} />
                              )}
                            />
                          }
                          label="Liability Waiver Received"
                        />
                        <FormControlLabel
                          control={
                            <Controller
                              control={control}
                              name="flight.mediaWaiver"
                              render={({ field }) => (
                                <Checkbox {...field} checked={field.value} />
                              )}
                            />
                          }
                          label="Media Waiver Received"
                        />
                        <FormControlLabel
                          control={
                            <Controller
                              control={control}
                              name="flight.vaccinated"
                              render={({ field }) => (
                                <Checkbox {...field} checked={field.value} />
                              )}
                            />
                          }
                          label="Vaccinated"
                        />
                        <FormControlLabel
                          control={
                            <Controller
                              control={control}
                              name="flight.infection_test"
                              render={({ field }) => (
                                <Checkbox {...field} checked={field.value} />
                              )}
                            />
                          }
                          label="Infection Tested"
                        />
                        <FormControlLabel
                          control={
                            <Controller
                              control={control}
                              name="flight.nofly"
                              render={({ field }) => (
                                <Checkbox {...field} checked={field.value} />
                              )}
                            />
                          }
                          label="Not Flying"
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Stack>

            {/* Contact Information Group */}
            <Stack spacing={3}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.main',
                  px: 2,
                  pt: 2 
                }}
              >
                Contact Information
              </Typography>

              {/* Address Information Card */}
              <Card id="address-section" elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent>
                  <SectionHeader 
                    icon={EnvelopeSimple} 
                    title="Address Information" 
                  />
                  <Grid container spacing={3}>
                    <Grid xs={12}>
                      <Controller
                        control={control}
                        name="address.street"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.address?.street)} fullWidth>
                            <InputLabel required>Street Address</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.address?.street && <FormHelperText>{errors.address.street.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="address.city"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.address?.city)} fullWidth>
                            <InputLabel required>City</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.address?.city && <FormHelperText>{errors.address.city.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="address.county"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.address?.county)} fullWidth>
                            <InputLabel required>County</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.address?.county && <FormHelperText>{errors.address.county.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="address.state"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.address?.state)} fullWidth>
                            <InputLabel required>State</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.address?.state && <FormHelperText>{errors.address.state.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="address.zip"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.address?.zip)} fullWidth>
                            <InputLabel required>ZIP Code</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.address?.zip && <FormHelperText>{errors.address.zip.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="address.phone_day"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.address?.phone_day)} fullWidth>
                            <InputLabel required>Day Phone</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.address?.phone_day && <FormHelperText>{errors.address.phone_day.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="address.phone_mbl"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.address?.phone_mbl)} fullWidth>
                            <InputLabel>Mobile Phone</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.address?.phone_mbl && <FormHelperText>{errors.address.phone_mbl.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="address.email"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.address?.email)} fullWidth>
                            <InputLabel>Email</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.address?.email && <FormHelperText>{errors.address.email.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Call Center Information Card */}
              <Card elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                    <SectionHeader 
                      icon={Headset} 
                      title="Call Center Information" 
                    />
                    <Button
                      startIcon={<Clock size={18} weight="bold" />}
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenHistory('Call Center', veteran.call?.history || [])}
                      sx={{
                        borderRadius: 1,
                        textTransform: 'none',
                        fontWeight: 'medium'
                      }}
                    >
                      History ({veteran.call?.history?.length || 0})
                    </Button>
                  </Stack>
                  <Grid container spacing={3}>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="call.assigned_to"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.call?.assigned_to)} fullWidth>
                            <InputLabel>Call Assigned To</InputLabel>
                            <OutlinedInput {...field} inputProps={{ maxLength: 30 }} />
                            {errors.call?.assigned_to ? <FormHelperText>{errors.call.assigned_to.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <Controller
                        control={control}
                        name="call.notes"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.call?.notes)} fullWidth>
                            <InputLabel>Call Center Notes</InputLabel>
                            <OutlinedInput {...field} multiline rows={3} />
                            {errors.call?.notes ? <FormHelperText>{errors.call.notes.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Controller
                            control={control}
                            name="call.mail_sent"
                            render={({ field }) => (
                              <Checkbox {...field} checked={field.value} />
                            )}
                          />
                        }
                        label="Veteran Mail Sent"
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Controller
                            control={control}
                            name="call.email_sent"
                            render={({ field }) => (
                              <Checkbox {...field} checked={field.value} />
                            )}
                          />
                        }
                        label="Email Veteran"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Emergency Contact Card */}
              <Card id="emergency-contact-section" elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent>
                  <SectionHeader 
                    icon={Phone} 
                    title="Emergency Contact" 
                  />
                  <Grid container spacing={3}>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="emerg_contact.name"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.emerg_contact?.name)} fullWidth>
                            <InputLabel>Emergency Contact Name</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.emerg_contact?.name && <FormHelperText>{errors.emerg_contact.name.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="emerg_contact.relation"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.emerg_contact?.relation)} fullWidth>
                            <InputLabel>Relationship</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.emerg_contact?.relation && <FormHelperText>{errors.emerg_contact.relation.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <Controller
                        control={control}
                        name="emerg_contact.address.street"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.emerg_contact?.address?.street)} fullWidth>
                            <InputLabel>Street Address</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.emerg_contact?.address?.street && <FormHelperText>{errors.emerg_contact.address.street.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="emerg_contact.address.city"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.emerg_contact?.address?.city)} fullWidth>
                            <InputLabel>City</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.emerg_contact?.address?.city && <FormHelperText>{errors.emerg_contact.address.city.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="emerg_contact.address.state"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.emerg_contact?.address?.state)} fullWidth>
                            <InputLabel>State</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.emerg_contact?.address?.state && <FormHelperText>{errors.emerg_contact.address.state.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="emerg_contact.address.zip"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.emerg_contact?.address?.zip)} fullWidth>
                            <InputLabel>ZIP Code</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.emerg_contact?.address?.zip && <FormHelperText>{errors.emerg_contact.address.zip.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="emerg_contact.address.phone"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.emerg_contact?.address?.phone)} fullWidth>
                            <InputLabel>Day Phone</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.emerg_contact?.address?.phone && <FormHelperText>{errors.emerg_contact.address.phone.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="emerg_contact.address.phone_mbl"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.emerg_contact?.address?.phone_mbl)} fullWidth>
                            <InputLabel>Mobile Phone</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.emerg_contact?.address?.phone_mbl && <FormHelperText>{errors.emerg_contact.address.phone_mbl.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="emerg_contact.address.email"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.emerg_contact?.address?.email)} fullWidth>
                            <InputLabel>Email</InputLabel>
                            <OutlinedInput {...field} type="email" />
                            {errors.emerg_contact?.address?.email && <FormHelperText>{errors.emerg_contact.address.email.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Alternate Contact Card */}
              <Card elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent>
                  <SectionHeader 
                    icon={Phone} 
                    title="Alternate Contact" 
                  />
                  <Grid container spacing={3}>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="alt_contact.name"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.alt_contact?.name)} fullWidth>
                            <InputLabel>Alternate Contact Name</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.alt_contact?.name && <FormHelperText>{errors.alt_contact.name.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="alt_contact.relation"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.alt_contact?.relation)} fullWidth>
                            <InputLabel>Relationship</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.alt_contact?.relation && <FormHelperText>{errors.alt_contact.relation.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <Controller
                        control={control}
                        name="alt_contact.address.street"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.alt_contact?.address?.street)} fullWidth>
                            <InputLabel>Street Address</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.alt_contact?.address?.street && <FormHelperText>{errors.alt_contact.address.street.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="alt_contact.address.city"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.alt_contact?.address?.city)} fullWidth>
                            <InputLabel>City</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.alt_contact?.address?.city && <FormHelperText>{errors.alt_contact.address.city.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="alt_contact.address.state"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.alt_contact?.address?.state)} fullWidth>
                            <InputLabel>State</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.alt_contact?.address?.state && <FormHelperText>{errors.alt_contact.address.state.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="alt_contact.address.zip"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.alt_contact?.address?.zip)} fullWidth>
                            <InputLabel>ZIP Code</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.alt_contact?.address?.zip && <FormHelperText>{errors.alt_contact.address.zip.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="alt_contact.address.phone"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.alt_contact?.address?.phone)} fullWidth>
                            <InputLabel>Day Phone</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.alt_contact?.address?.phone && <FormHelperText>{errors.alt_contact.address.phone.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="alt_contact.address.phone_mbl"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.alt_contact?.address?.phone_mbl)} fullWidth>
                            <InputLabel>Mobile Phone</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.alt_contact?.address?.phone_mbl && <FormHelperText>{errors.alt_contact.address.phone_mbl.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="alt_contact.address.email"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.alt_contact?.address?.email)} fullWidth>
                            <InputLabel>Email</InputLabel>
                            <OutlinedInput {...field} type="email" />
                            {errors.alt_contact?.address?.email && <FormHelperText>{errors.alt_contact.address.email.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Guardian Information Card */}
              <Card id="guardian-pairing" elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }} ref={guardianPairingRef}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                    <SectionHeader 
                      icon={Users} 
                      title="Guardian Pairing Information" 
                    />
                    <Button
                      startIcon={<Gear size={18} weight="bold" />}
                      variant="outlined"
                      size="small"
                      onClick={() => setPairingDialogOpen(true)}
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
                    {veteran.guardian?.id && veteran.guardian?.name && (
                      <>
                        <Grid xs={12} md={6}>
                          <InputLabel sx={{ mb: 2 }}>Currently Paired Guardian</InputLabel>
                          <Stack spacing={2}>
                            <Card
                              variant="outlined"
                              onClick={() => {
                                sessionStorage.setItem('previousPage', 'veteran-details');
                                router.push(paths.main.guardians.details(veteran.guardian.id));
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
                                    {veteran.guardian.name}
                                  </Typography>
                                  <Eye size={20} color="var(--mui-palette-primary-main)" style={{ cursor: 'pointer' }} />
                                </Stack>
                              </CardContent>
                            </Card>
                          </Stack>
                        </Grid>
                        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, mx: 2 }} />
                      </>
                    )}
                    <Grid xs={12} md={veteran.guardian?.id && veteran.guardian?.name ? 5.5 : 12}>
                      <InputLabel sx={{ mb: 2 }}>
                        Guardian Preference Notes
                      </InputLabel>
                      <Controller
                        control={control}
                        name="guardian.pref_notes"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.guardian?.pref_notes)} fullWidth>
                            <OutlinedInput {...field} multiline rows={8} placeholder="Guardian Preference Notes" />
                            {errors.guardian?.pref_notes && <FormHelperText>{errors.guardian.pref_notes.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    {/* Hidden fields for guardian data */}
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
                  </Grid>
                </CardContent>
              </Card>

              {/* Mail Call Information Card */}
              <Card elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent>
                  <SectionHeader 
                    icon={EnvelopeSimple} 
                    title="Mail Call Information" 
                  />
                  <Grid container spacing={3}>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="mail_call.name"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.mail_call?.name)} fullWidth>
                            <InputLabel>Contact Name</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.mail_call?.name && <FormHelperText>{errors.mail_call.name.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="mail_call.relation"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.mail_call?.relation)} fullWidth>
                            <InputLabel>Relationship</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.mail_call?.relation && <FormHelperText>{errors.mail_call.relation.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <Controller
                        control={control}
                        name="mail_call.notes"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.mail_call?.notes)} fullWidth>
                            <InputLabel>Notes</InputLabel>
                            <OutlinedInput {...field} multiline rows={2} />
                            {errors.mail_call?.notes && <FormHelperText>{errors.mail_call.notes.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="mail_call.address.phone"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.mail_call?.address?.phone)} fullWidth>
                            <InputLabel>Mail Call Phone</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.mail_call?.address?.phone ? <FormHelperText>{errors.mail_call.address.phone.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="mail_call.address.email"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.mail_call?.address?.email)} fullWidth>
                            <InputLabel>Mail Call Email</InputLabel>
                            <OutlinedInput {...field} type="email" />
                            {errors.mail_call?.address?.email ? <FormHelperText>{errors.mail_call.address.email.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Controller
                            control={control}
                            name="mail_call.received"
                            render={({ field }) => (
                              <Checkbox {...field} checked={field.value} />
                            )}
                          />
                        }
                        label="Mail Call Received"
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Controller
                            control={control}
                            name="mail_call.adopt"
                            render={({ field }) => (
                              <Checkbox {...field} checked={field.value} />
                            )}
                          />
                        }
                        label="Mail Call Adoption"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Stack>

            {/* Additional Details Group */}
            <Stack spacing={3}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.main',
                  px: 2,
                  pt: 2 
                }}
              >
                Additional Details
              </Typography>

              {/* Apparel Information Card */}
              <Card elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent>
                  <SectionHeader 
                    icon={TShirt} 
                    title="Apparel Information" 
                  />
                  <Grid container spacing={3}>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="apparel.item"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.apparel?.item)} fullWidth>
                            <InputLabel>Apparel Item</InputLabel>
                            <Select {...field}>
                              <Option value="">None</Option>
                              <Option value="Jacket">Jacket</Option>
                              <Option value="Polo">Polo</Option>
                              <Option value="Both">Both</Option>
                            </Select>
                            {errors.apparel?.item && <FormHelperText>{errors.apparel.item.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="apparel.jacket_size"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.apparel?.jacket_size)} fullWidth>
                            <InputLabel>Jacket Size</InputLabel>
                            <Select {...field}>
                              <Option value="">None</Option>
                              <Option value="XS">XS</Option>
                              <Option value="S">Small</Option>
                              <Option value="M">Medium</Option>
                              <Option value="L">Large</Option>
                              <Option value="XL">X-Large</Option>
                              <Option value="2XL">2X-Large</Option>
                              <Option value="3XL">3X-Large</Option>
                              <Option value="4XL">4X-Large</Option>
                              <Option value="5XL">5X-Large</Option>
                            </Select>
                            {errors.apparel?.jacket_size && <FormHelperText>{errors.apparel.jacket_size.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="apparel.shirt_size"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.apparel?.shirt_size)} fullWidth>
                            <InputLabel>Apparel Shirt Size</InputLabel>
                            <Select {...field}>
                              <Option value="">None</Option>
                              <Option value="WXS">WXS</Option>
                              <Option value="WS">WS</Option>
                              <Option value="WM">WM</Option>
                              <Option value="WL">WL</Option>
                              <Option value="WXL">WXL</Option>
                              <Option value="W2XL">W2XL</Option>
                              <Option value="W3XL">W3XL</Option>
                              <Option value="W4XL">W4XL</Option>
                              <Option value="W5XL">W5XL</Option>
                              <Option value="XS">XS</Option>
                              <Option value="S">Small</Option>
                              <Option value="M">Medium</Option>
                              <Option value="L">Large</Option>
                              <Option value="XL">X-Large</Option>
                              <Option value="2XL">2X-Large</Option>
                              <Option value="3XL">3X-Large</Option>
                              <Option value="4XL">4X-Large</Option>
                              <Option value="5XL">5X-Large</Option>
                            </Select>
                            {errors.apparel?.shirt_size && <FormHelperText>{errors.apparel.shirt_size.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="apparel.date"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.apparel?.date)} fullWidth>
                            <InputLabel>Date Sent</InputLabel>
                            <OutlinedInput {...field} type="date" />
                            {errors.apparel?.date && <FormHelperText>{errors.apparel.date.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="apparel.delivery"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.apparel?.delivery)} fullWidth>
                            <InputLabel>Delivery Status</InputLabel>
                            <Select {...field}>
                              <Option value="">None</Option>
                              <Option value="Mailed">Mailed</Option>
                              <Option value="Training">Training</Option>
                              <Option value="Home">Home</Option>
                            </Select>
                            {errors.apparel?.delivery && <FormHelperText>{errors.apparel.delivery.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="apparel.by"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.apparel?.by)} fullWidth>
                            <InputLabel>Sent By</InputLabel>
                            <OutlinedInput {...field} inputProps={{ maxLength: 30 }} />
                            {errors.apparel?.by && <FormHelperText>{errors.apparel.by.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <Controller
                        control={control}
                        name="apparel.notes"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.apparel?.notes)} fullWidth>
                            <InputLabel>Apparel Notes</InputLabel>
                            <OutlinedInput {...field} multiline rows={3} />
                            {errors.apparel?.notes && <FormHelperText>{errors.apparel.notes.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    {/* Application shirt size (separate from apparel shirt size) */}
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="shirt.size"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.shirt?.size)} fullWidth>
                            <InputLabel>Application Shirt Size</InputLabel>
                            <Select {...field}>
                              <Option value="">Select size</Option>
                              <Option value="S">Small</Option>
                              <Option value="M">Medium</Option>
                              <Option value="L">Large</Option>
                              <Option value="XL">X-Large</Option>
                              <Option value="2XL">2X-Large</Option>
                              <Option value="3XL">3X-Large</Option>
                              <Option value="4XL">4X-Large</Option>
                              <Option value="5XL">5X-Large</Option>
                            </Select>
                            {errors.shirt?.size && <FormHelperText>{errors.shirt.size.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Homecoming Card */}
              <Card elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent>
                  <SectionHeader 
                    icon={House} 
                    title="Homecoming Information" 
                  />
                  <Grid container spacing={3}>
                    <Grid xs={12}>
                      <Controller
                        control={control}
                        name="homecoming.destination"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.homecoming?.destination)} fullWidth>
                            <InputLabel>Homecoming Destination</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.homecoming?.destination && <FormHelperText>{errors.homecoming.destination.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Media Permissions Card */}
              <Card elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent>
                  <SectionHeader 
                    icon={Camera} 
                    title="Media Permissions" 
                  />
                  <Grid container spacing={3}>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="media_newspaper_ok"
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Newspaper Permission</InputLabel>
                            <Select {...field}>
                              <Option value="Unknown">Unknown</Option>
                              <Option value="Yes">Yes</Option>
                              <Option value="No">No</Option>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="media_interview_ok"
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Interview Permission</InputLabel>
                            <Select {...field}>
                              <Option value="Unknown">Unknown</Option>
                              <Option value="Yes">Yes</Option>
                              <Option value="No">No</Option>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Metadata Card */}
              <Card elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent>
                  <SectionHeader 
                    icon={Clock} 
                    title="Record Information" 
                  />
                  <Grid container spacing={3}>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="metadata.created_at"
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Created At</InputLabel>
                            <OutlinedInput {...field} InputProps={{ readOnly: true }} />
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="metadata.created_by"
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Created By</InputLabel>
                            <OutlinedInput {...field} InputProps={{ readOnly: true }} />
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="metadata.updated_at"
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Updated At</InputLabel>
                            <OutlinedInput {...field} InputProps={{ readOnly: true }} />
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="metadata.updated_by"
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Updated By</InputLabel>
                            <OutlinedInput {...field} InputProps={{ readOnly: true }} />
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Stack>
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