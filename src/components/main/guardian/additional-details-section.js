'use client';

import * as React from 'react';
import { Controller } from 'react-hook-form';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { TShirt, Clock } from '@phosphor-icons/react';
import { Option } from '@/components/core/option';
import { FormSectionHeader } from '@/components/main/shared/form-section-header';
import { FormTextField } from '@/components/main/shared/form-text-field';

export function AdditionalDetailsSection({ control, errors }) {
  return (
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
          <FormSectionHeader 
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
          <FormSectionHeader 
            icon={Clock} 
            title="Record Information" 
          />
          <Grid container spacing={3}>
            <FormTextField
              control={control}
              name="metadata.created_at"
              label="Created At"
              error={errors.metadata?.created_at}
              InputProps={{ readOnly: true }}
              gridProps={{ xs: 12, md: 6 }}
            />
            <FormTextField
              control={control}
              name="metadata.created_by"
              label="Created By"
              error={errors.metadata?.created_by}
              InputProps={{ readOnly: true }}
              gridProps={{ xs: 12, md: 6 }}
            />
            <FormTextField
              control={control}
              name="metadata.updated_at"
              label="Updated At"
              error={errors.metadata?.updated_at}
              InputProps={{ readOnly: true }}
              gridProps={{ xs: 12, md: 6 }}
            />
            <FormTextField
              control={control}
              name="metadata.updated_by"
              label="Updated By"
              error={errors.metadata?.updated_by}
              InputProps={{ readOnly: true }}
              gridProps={{ xs: 12, md: 6 }}
            />
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );
}

