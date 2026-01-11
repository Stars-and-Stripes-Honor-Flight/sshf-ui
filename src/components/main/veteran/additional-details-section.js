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
import { TShirt, House, Camera, Clock } from '@phosphor-icons/react';
import { Option } from '@/components/core/option';
import { FormSectionHeader } from '@/components/main/shared/form-section-header';
import { FormTextField } from '@/components/main/shared/form-text-field';

export function AdditionalDetailsSection({ control, errors, disabled = false }) {
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
                name="apparel.item"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.apparel?.item)} fullWidth disabled={disabled}>
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
                  <FormControl error={Boolean(errors.apparel?.jacket_size)} fullWidth disabled={disabled}>
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
                  <FormControl error={Boolean(errors.apparel?.shirt_size)} fullWidth disabled={disabled}>
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
                  <FormControl error={Boolean(errors.apparel?.date)} fullWidth disabled={disabled}>
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
                  <FormControl error={Boolean(errors.apparel?.delivery)} fullWidth disabled={disabled}>
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
                  <FormControl error={Boolean(errors.apparel?.by)} fullWidth disabled={disabled}>
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
                  <FormControl error={Boolean(errors.apparel?.notes)} fullWidth disabled={disabled}>
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
                  <FormControl error={Boolean(errors.shirt?.size)} fullWidth disabled={disabled}>
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
          <FormSectionHeader 
            icon={House} 
            title="Homecoming Information" 
          />
          <Grid container spacing={3}>
            <Grid xs={12}>
              <Controller
                control={control}
                name="homecoming.destination"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.homecoming?.destination)} fullWidth disabled={disabled}>
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
          <FormSectionHeader 
            icon={Camera} 
            title="Media Permissions" 
          />
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Controller
                control={control}
                name="media_newspaper_ok"
                render={({ field }) => (
                  <FormControl fullWidth disabled={disabled}>
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
                  <FormControl fullWidth disabled={disabled}>
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
              disabled={true}
              InputProps={{ readOnly: true }}
              gridProps={{ xs: 12, md: 6 }}
            />
            <FormTextField
              control={control}
              name="metadata.created_by"
              label="Created By"
              error={errors.metadata?.created_by}
              disabled={true}
              InputProps={{ readOnly: true }}
              gridProps={{ xs: 12, md: 6 }}
            />
            <FormTextField
              control={control}
              name="metadata.updated_at"
              label="Updated At"
              error={errors.metadata?.updated_at}
              disabled={true}
              InputProps={{ readOnly: true }}
              gridProps={{ xs: 12, md: 6 }}
            />
            <FormTextField
              control={control}
              name="metadata.updated_by"
              label="Updated By"
              error={errors.metadata?.updated_by}
              disabled={true}
              InputProps={{ readOnly: true }}
              gridProps={{ xs: 12, md: 6 }}
            />
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );
}

