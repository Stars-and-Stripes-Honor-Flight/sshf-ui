'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
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
import { Controller, useForm } from 'react-hook-form';
import Chip from '@mui/material/Chip';
import { 
  User, 
  Person,
  Airplane,
  Phone,
  Users,
  EnvelopeSimple,
  TShirt,
  FirstAid,
  Calendar,
  Headset,
  Clock,
  Eye,
  X,
  Plus,
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

// Component for section headers
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

export function GuardianEditForm({ guardian }) {
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
  const handleGoBack = useNavigationBack();

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
          _rev: guardianRev,
          type: 'Guardian'
        };
        
        // Remove metadata (API handles this)
        delete payload.metadata;
        
        // Remove history arrays from nested objects
        if (payload.flight?.history) delete payload.flight.history;
        if (payload.veteran?.history) delete payload.veteran.history;
        if (payload.call?.history) delete payload.call.history;
        
        await api.updateGuardian(data._id, payload);
        toast.success('Guardian updated successfully');
        
        handleGoBack();
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
                  {/* Mobile: Single column info (below name) */}
                  <Stack spacing={2} sx={{ display: { xs: 'block', md: 'none' } }}>
                    <Typography variant="body2">
                      {watchTraining ? `Training: ${watchTraining}` : 'No Training Completed'}
                    </Typography>
                    <Divider />
                    {/* Veteran Pairings Display - Mobile */}
                    {guardian.veteran?.pairings?.length > 0 ? (
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Paired Veterans
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
                        <Stack spacing={1}>
                          {guardian.veteran.pairings.map((pairing, index) => (
                            <Card
                              key={pairing.id || index}
                              variant="outlined"
                              onClick={() => {
                                sessionStorage.setItem('previousPage', 'guardian-details');
                                router.push(paths.main.veterans.details(pairing.id));
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
                                    {pairing.name}
                                  </Typography>
                                  <Eye size={16} color="var(--mui-palette-primary-main)" />
                                </Stack>
                              </CardContent>
                            </Card>
                          ))}
                        </Stack>
                      </Box>
                    ) : (
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LinkBreak size={16} color="var(--mui-palette-warning-main)" />
                            <Typography variant="caption" color="text.secondary">
                              No Veterans Paired
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
                        {guardian.veteran?.pairings?.length > 0 ? (
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Paired Veterans
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
                            <Stack spacing={1}>
                              {guardian.veteran.pairings.map((pairing, index) => (
                                <Card
                                  key={pairing.id || index}
                                  variant="outlined"
                                  onClick={() => {
                                    sessionStorage.setItem('previousPage', 'guardian-details');
                                    router.push(paths.main.veterans.details(pairing.id));
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
                                        {pairing.name}
                                      </Typography>
                                      <Eye size={16} color="var(--mui-palette-primary-main)" />
                                    </Stack>
                                  </CardContent>
                                </Card>
                              ))}
                            </Stack>
                          </Box>
                        ) : (
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <LinkBreak size={16} color="var(--mui-palette-warning-main)" />
                                <Typography variant="caption" color="text.secondary">
                                  No Veterans Paired
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
            <GoodToFlyStatus data={watch()} type="guardian" onScrollToSection={handleScrollToSection} />
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
                    <Grid xs={12} md={6}>
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

              {/* Medical Information Card */}
              <Card id="medical-section" elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent>
                  <SectionHeader 
                    icon={FirstAid} 
                    title="Medical Information" 
                  />
                  <Grid container spacing={3}>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="occupation"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.occupation)} fullWidth>
                            <InputLabel>Occupation</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.occupation ? <FormHelperText>{errors.occupation.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="notes.service"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.notes?.service)} fullWidth>
                            <InputLabel>Are you a veteran?</InputLabel>
                            <Select {...field}>
                              <Option value="N">No</Option>
                              <Option value="Y">Yes</Option>
                            </Select>
                            {errors.notes?.service ? <FormHelperText>{errors.notes.service.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="medical.level"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.medical?.level)} fullWidth>
                            <InputLabel>Medical Level</InputLabel>
                            <Select {...field}>
                              <Option value="">None</Option>
                              <Option value="A">A</Option>
                              <Option value="B">B</Option>
                              <Option value="C">C</Option>
                              <Option value="D">D</Option>
                            </Select>
                            {errors.medical?.level ? <FormHelperText>{errors.medical.level.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="medical.food_restriction"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.medical?.food_restriction)} fullWidth>
                            <InputLabel>Food Restrictions</InputLabel>
                            <Select {...field}>
                              <Option value="None">None</Option>
                              <Option value="Vegetarian">Vegetarian</Option>
                              <Option value="Vegan">Vegan</Option>
                              <Option value="Gluten Free">Gluten Free</Option>
                              <Option value="Diabetic">Diabetic</Option>
                              <Option value="Other">Other</Option>
                            </Select>
                            {errors.medical?.food_restriction ? <FormHelperText>{errors.medical.food_restriction.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <Controller
                        control={control}
                        name="notes.other"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.notes?.other)} fullWidth>
                            <InputLabel>Service Details</InputLabel>
                            <OutlinedInput {...field} multiline rows={3} />
                            {errors.notes?.other ? <FormHelperText>{errors.notes.other.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                        Physical Capabilities
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        <Controller
                          control={control}
                          name="medical.can_push"
                          render={({ field }) => (
                            <FormControlLabel
                              control={<Checkbox {...field} checked={field.value} />}
                              label="Can Push Wheelchair"
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name="medical.can_lift"
                          render={({ field }) => (
                            <FormControlLabel
                              control={<Checkbox {...field} checked={field.value} />}
                              label="Can Lift"
                            />
                          )}
                        />
                      </Stack>
                    </Grid>
                    <Grid xs={12}>
                      <Controller
                        control={control}
                        name="medical.limitations"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.medical?.limitations)} fullWidth>
                            <InputLabel>Medical Limitations</InputLabel>
                            <OutlinedInput {...field} multiline rows={3} />
                            {errors.medical?.limitations ? <FormHelperText>{errors.medical.limitations.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <Controller
                        control={control}
                        name="medical.experience"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.medical?.experience)} fullWidth>
                            <InputLabel>Medical Experience</InputLabel>
                            <OutlinedInput {...field} multiline rows={3} />
                            {errors.medical?.experience ? <FormHelperText>{errors.medical.experience.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                        Medical Forms
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        <Controller
                          control={control}
                          name="medical.release"
                          render={({ field }) => (
                            <FormControlLabel
                              control={<Checkbox {...field} checked={field.value} />}
                              label="Medical Release Signed"
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name="medical.form"
                          render={({ field }) => (
                            <FormControlLabel
                              control={<Checkbox {...field} checked={field.value} />}
                              label="Medical Form Completed"
                            />
                          )}
                        />
                      </Stack>
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
                      onClick={() => handleOpenHistory('Call Center', guardian.call?.history || [])}
                      sx={{
                        borderRadius: 1,
                        textTransform: 'none',
                        fontWeight: 'medium'
                      }}
                    >
                      History ({guardian.call?.history?.length || 0})
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
                            <OutlinedInput {...field} />
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
                            <InputLabel>Call Notes</InputLabel>
                            <OutlinedInput {...field} multiline rows={3} />
                            {errors.call?.notes ? <FormHelperText>{errors.call.notes.message}</FormHelperText> : null}
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
                            <OutlinedInput {...field} />
                            {errors.flight?.confirmed_by ? <FormHelperText>{errors.flight.confirmed_by.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <Controller
                        control={control}
                        name="call.email_sent"
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Checkbox {...field} checked={field.value} />}
                            label="Email Sent"
                          />
                        )}
                      />
                    </Grid>
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
                      onClick={() => handleOpenHistory('Flight Status', guardian.flight?.history || [])}
                      sx={{
                        borderRadius: 1,
                        textTransform: 'none',
                        fontWeight: 'medium'
                      }}
                    >
                      History ({guardian.flight?.history?.length || 0})
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
                              <Option value="Copied">Copied</Option>
                            </Select>
                            {errors.flight?.status ? <FormHelperText>{errors.flight.status.message}</FormHelperText> : null}
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
                            <InputLabel>Flight ID</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.flight?.id ? <FormHelperText>{errors.flight.id.message}</FormHelperText> : null}
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
                            <InputLabel>Bus Assignment</InputLabel>
                            <Select {...field}>
                              <Option value="None">None</Option>
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
                        name="flight.seat"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.flight?.seat)} fullWidth>
                            <InputLabel>Seat Assignment</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.flight?.seat ? <FormHelperText>{errors.flight.seat.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="flight.waiver"
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Checkbox {...field} checked={field.value} />}
                            label="Waiver Received"
                          />
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="flight.vaccinated"
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Checkbox {...field} checked={field.value} />}
                            label="Vaccinated"
                          />
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="flight.paid"
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Checkbox {...field} checked={field.value} />}
                            label="Paid"
                          />
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="flight.training"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.flight?.training)} fullWidth>
                            <InputLabel>Training</InputLabel>
                            <Select {...field}>
                              <Option value="None">None</Option>
                              <Option value="Main">Main</Option>
                              <Option value="Previous">Previous</Option>
                              <Option value="Phone">Phone</Option>
                              <Option value="Web">Web</Option>
                            </Select>
                            {errors.flight?.training ? <FormHelperText>{errors.flight.training.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="flight.booksOrdered"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.flight?.booksOrdered)} fullWidth>
                            <InputLabel>Books Ordered</InputLabel>
                            <OutlinedInput {...field} type="number" inputProps={{ min: 0 }} />
                            {errors.flight?.booksOrdered ? <FormHelperText>{errors.flight.booksOrdered.message}</FormHelperText> : null}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <Controller
                        control={control}
                        name="flight.training_notes"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.flight?.training_notes)} fullWidth>
                            <InputLabel>Training Notes</InputLabel>
                            <OutlinedInput {...field} multiline rows={3} />
                            {errors.flight?.training_notes ? <FormHelperText>{errors.flight.training_notes.message}</FormHelperText> : null}
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
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                        Training & Status
                      </Typography>
                      <Stack direction="row" spacing={2} flexWrap="wrap">
                        <Controller
                          control={control}
                          name="flight.training_complete"
                          render={({ field }) => (
                            <FormControlLabel
                              control={<Checkbox {...field} checked={field.value} />}
                              label="Training Complete"
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name="flight.training_see_doc"
                          render={({ field }) => (
                            <FormControlLabel
                              control={<Checkbox {...field} checked={field.value} />}
                              label="Training See Doc"
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name="flight.mediaWaiver"
                          render={({ field }) => (
                            <FormControlLabel
                              control={<Checkbox {...field} checked={field.value} />}
                              label="Media Waiver"
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name="flight.infection_test"
                          render={({ field }) => (
                            <FormControlLabel
                              control={<Checkbox {...field} checked={field.value} />}
                              label="Infection Test"
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name="flight.nofly"
                          render={({ field }) => (
                            <FormControlLabel
                              control={<Checkbox {...field} checked={field.value} />}
                              label="Not Flying"
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name="flight.exempt"
                          render={({ field }) => (
                            <FormControlLabel
                              control={<Checkbox {...field} checked={field.value} />}
                              label="Exempt"
                            />
                          )}
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
                    <Grid xs={12}>
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
                    <Grid xs={12} md={6}>
                      <Controller
                        control={control}
                        name="emerg_contact.address.phone"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.emerg_contact?.address?.phone)} fullWidth>
                            <InputLabel>Phone</InputLabel>
                            <OutlinedInput {...field} />
                            {errors.emerg_contact?.address?.phone && <FormHelperText>{errors.emerg_contact.address.phone.message}</FormHelperText>}
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
                            <OutlinedInput {...field} />
                            {errors.emerg_contact?.address?.email && <FormHelperText>{errors.emerg_contact.address.email.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Veteran Pairing Information Card */}
              <Card id="veteran-pairings" elevation={2} sx={{ '&:hover': { transform: 'translateY(-2px)' } }} ref={veteranPairingsRef}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                    <SectionHeader 
                      icon={Users} 
                      title="Veteran Pairing Information" 
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
                    {guardian.veteran?.pairings?.length > 0 && (
                      <>
                        <Grid xs={12} md={6}>
                          <InputLabel sx={{ mb: 2 }}>Currently Paired Veterans</InputLabel>
                          <Stack spacing={2}>
                            {guardian.veteran.pairings.map((pairing, index) => (
                              <Card
                                key={pairing.id || index}
                                variant="outlined"
                                onClick={() => {
                                  sessionStorage.setItem('previousPage', 'guardian-details');
                                  router.push(paths.main.veterans.details(pairing.id));
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
                            ))}
                          </Stack>
                        </Grid>
                        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, mx: 2 }} />
                      </>
                    )}
                    <Grid xs={12} md={guardian.veteran?.pairings?.length > 0 ? 5.5 : 12}>
                      <InputLabel sx={{ mb: 2 }}>
                        Veteran Preference Notes
                      </InputLabel>
                      <Controller
                        control={control}
                        name="veteran.pref_notes"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.veteran?.pref_notes)} fullWidth>
                            <OutlinedInput {...field} multiline rows={8} placeholder="Veteran Preference Notes" />
                            {errors.veteran?.pref_notes && <FormHelperText>{errors.veteran.pref_notes.message}</FormHelperText>}
                          </FormControl>
                        )}
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
                        name="shirt.size"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.shirt?.size)} fullWidth>
                            <InputLabel>Shirt Size</InputLabel>
                            <Select {...field}>
                              <Option value="None">None</Option>
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
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="apparel.jacket_size"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.apparel?.jacket_size)} fullWidth>
                            <InputLabel>Jacket Size</InputLabel>
                            <Select {...field}>
                              <Option value="None">None</Option>
                              <Option value="XS">X-Small</Option>
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
                        name="apparel.delivery"
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Delivery Method</InputLabel>
                            <Select {...field}>
                              <Option value="None">None</Option>
                              <Option value="Mailed">Mailed</Option>
                              <Option value="Training">Training</Option>
                              <Option value="Home">Home</Option>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <Controller
                        control={control}
                        name="apparel.item"
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Apparel Items</InputLabel>
                            <Select {...field}>
                              <Option value="None">None</Option>
                              <Option value="Jacket">Jacket</Option>
                              <Option value="Polo">Polo</Option>
                              <Option value="Both">Both</Option>
                            </Select>
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
                              <Option value="None">None</Option>
                              <Option value="XS">X-Small</Option>
                              <Option value="S">Small</Option>
                              <Option value="M">Medium</Option>
                              <Option value="L">Large</Option>
                              <Option value="XL">X-Large</Option>
                              <Option value="2XL">2X-Large</Option>
                              <Option value="3XL">3X-Large</Option>
                              <Option value="4XL">4X-Large</Option>
                              <Option value="5XL">5X-Large</Option>
                              <Option value="WXS">WX-Small</Option>
                              <Option value="WS">W-Small</Option>
                              <Option value="WM">W-Medium</Option>
                              <Option value="WL">W-Large</Option>
                              <Option value="WXL">WX-Large</Option>
                              <Option value="W2XL">W2X-Large</Option>
                              <Option value="W3XL">W3X-Large</Option>
                              <Option value="W4XL">W4X-Large</Option>
                              <Option value="W5XL">W5X-Large</Option>
                            </Select>
                            {errors.apparel?.shirt_size ? <FormHelperText>{errors.apparel.shirt_size.message}</FormHelperText> : null}
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
                            {errors.apparel?.date ? <FormHelperText>{errors.apparel.date.message}</FormHelperText> : null}
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
                            <OutlinedInput {...field} />
                            {errors.apparel?.by ? <FormHelperText>{errors.apparel.by.message}</FormHelperText> : null}
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
                            {errors.apparel?.notes ? <FormHelperText>{errors.apparel.notes.message}</FormHelperText> : null}
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
            onClick={() => {
              handleGoBack();
            }}
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
            Veteran Pairing Management
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
                Veteran Preference Notes:
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
                {watch('veteran.pref_notes') || guardian.veteran?.pref_notes || 'No preference notes entered.'}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>
    </form>
  );
} 