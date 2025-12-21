'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { ThumbsUp, ArrowRight, FirstAid, EnvelopeSimple, Phone, Airplane, CurrencyDollar, Users } from '@phosphor-icons/react';

/**
 * Checks if a veteran is good to fly
 * @param {Object} data - The veteran data object
 * @returns {Object} - { isGoodToFly: boolean, missingItems: Array<{text: string, sectionId: string}> }
 */
function checkVeteranGoodToFly(data) {
  const missingItems = [];

  // Check medical requirements
  if (!data.medical?.form) {
    missingItems.push({ text: 'Medical form not completed', sectionId: 'medical-section', icon: FirstAid });
  }
  if (!data.medical?.level) {
    missingItems.push({ text: 'Medical level not set', sectionId: 'medical-section', icon: FirstAid });
  }

  // Check essential contact info
  if (!data.address?.street || !data.address?.city || !data.address?.state || !data.address?.zip) {
    missingItems.push({ text: 'Complete address required', sectionId: 'address-section', icon: EnvelopeSimple });
  }
  if (!data.address?.phone_day && !data.address?.phone_mbl) {
    missingItems.push({ text: 'Phone number required', sectionId: 'address-section', icon: EnvelopeSimple });
  }

  // Check emergency contact
  if (!data.emerg_contact?.name || !data.emerg_contact?.address?.phone) {
    missingItems.push({ text: 'Emergency contact information required', sectionId: 'emergency-contact-section', icon: Phone });
  }

  // Check guardian pairing
  if (!data.guardian?.id && !data.guardian?.name) {
    missingItems.push({ text: 'Guardian pairing required', sectionId: 'guardian-pairing', icon: Users });
  }

  return {
    isGoodToFly: missingItems.length === 0,
    missingItems
  };
}

/**
 * Checks if a guardian is good to fly
 * @param {Object} data - The guardian data object
 * @returns {Object} - { isGoodToFly: boolean, missingItems: Array<{text: string, sectionId: string}> }
 */
function checkGuardianGoodToFly(data) {
  const missingItems = [];

  // Check medical requirements
  if (!data.medical?.form) {
    missingItems.push({ text: 'Medical form not completed', sectionId: 'medical-section', icon: FirstAid });
  }
  if (!data.medical?.level) {
    missingItems.push({ text: 'Medical level not set', sectionId: 'medical-section', icon: FirstAid });
  }

  // Check essential contact info
  if (!data.address?.street || !data.address?.city || !data.address?.state || !data.address?.zip) {
    missingItems.push({ text: 'Complete address required', sectionId: 'address-section', icon: EnvelopeSimple });
  }
  if (!data.address?.phone_day && !data.address?.phone_mbl) {
    missingItems.push({ text: 'Phone number required', sectionId: 'address-section', icon: EnvelopeSimple });
  }

  // Check emergency contact
  if (!data.emerg_contact?.name || !data.emerg_contact?.address?.phone) {
    missingItems.push({ text: 'Emergency contact information required', sectionId: 'emergency-contact-section', icon: Phone });
  }

  // Check guardian-specific requirements
  if (!data.flight?.training || data.flight.training === 'None') {
    missingItems.push({ text: 'Training not completed', sectionId: 'flight-section', icon: Airplane });
  }
  if (data.flight?.paid === false && data.flight?.exempt !== true) {
    missingItems.push({ text: 'Payment not confirmed', sectionId: 'flight-section', icon: CurrencyDollar });
  }

  // Check veteran pairing
  if (!data.veteran?.pairings || data.veteran.pairings.length === 0) {
    missingItems.push({ text: 'Veteran pairing required', sectionId: 'veteran-pairings', icon: Users });
  }

  return {
    isGoodToFly: missingItems.length === 0,
    missingItems
  };
}

export function GoodToFlyStatus({ data, type = 'veteran', onScrollToSection }) {
  const checkResult = React.useMemo(() => {
    if (type === 'veteran') {
      return checkVeteranGoodToFly(data);
    } else {
      return checkGuardianGoodToFly(data);
    }
  }, [data, type]);

  const handleItemClick = React.useCallback((sectionId) => {
    if (onScrollToSection && sectionId) {
      onScrollToSection(sectionId);
    }
  }, [onScrollToSection]);

  return (
    <Card
      sx={{
        position: 'sticky',
        top: 24,
        backgroundColor: 'background.neutral',
        boxShadow: (theme) => theme.shadows[8],
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={3} sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Good to Fly Status
          </Typography>
          
          {checkResult.isGoodToFly ? (
            <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
              <ThumbsUp 
                size={120}
                weight="fill"
                color="var(--mui-palette-success-main)"
              />
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold',
                  color: 'success.main',
                  textAlign: 'center'
                }}
              >
                All Set!
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ textAlign: 'center' }}
              >
                All requirements have been met
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Alert severity="warning">
                <AlertTitle sx={{ fontWeight: 'bold' }}>
                  Action Required
                </AlertTitle>
              </Alert>
              <List dense sx={{ py: 0 }}>
                {checkResult.missingItems.map((item, index) => {
                  const IconComponent = item.icon || ArrowRight;
                  return (
                    <ListItem 
                      key={index} 
                      sx={{ 
                        py: 1, 
                        px: 2,
                        cursor: item.sectionId ? 'pointer' : 'default',
                        borderRadius: 1,
                        '&:hover': item.sectionId ? {
                          backgroundColor: 'action.hover'
                        } : {}
                      }}
                      onClick={() => item.sectionId && handleItemClick(item.sectionId)}
                    >
                      <ListItemIcon sx={{ minWidth: 40, mr: 1 }}>
                        <IconComponent 
                          size={20} 
                          color="var(--mui-palette-text-secondary)"
                          weight="regular"
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text}
                        primaryTypographyProps={{
                          variant: 'body2'
                        }}
                      />
                      {item.sectionId && (
                        <ArrowRight 
                          size={16} 
                          color="var(--mui-palette-text-secondary)"
                          style={{ marginLeft: '8px', marginRight: '8px' }}
                        />
                      )}
                    </ListItem>
                  );
                })}
              </List>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

