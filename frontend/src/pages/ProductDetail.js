import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Paper,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { productApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productApi.getById(id);
        setProduct(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product details');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleEdit = () => {
    // Navigate to edit page or open edit modal
    // For this demo, we'll just go back to the product list
    // where the edit functionality is implemented
    navigate('/products');
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productApi.delete(id);
        navigate('/products');
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('Failed to delete product');
      }
    }
  };

  const handleBack = () => {
    navigate('/products');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography variant="h6">{error}</Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={handleBack}
          >
            Back to Products
          </Button>
        </Paper>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Product not found</Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={handleBack}
          >
            Back to Products
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Product Details</Typography>
      </Box>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                  {product.name}
                </Typography>
                <Chip 
                  label={product.category} 
                  color="primary" 
                  size="small" 
                  sx={{ mb: 2 }}
                />
                <Typography variant="body1" paragraph>
                  {product.description}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Product Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">ID</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.id}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Category</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.category}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Stock Quantity</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.stock_quantity} units
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Stock Status</Typography>
                  <Chip 
                    label={product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'} 
                    color={product.stock_quantity > 0 ? 'success' : 'error'} 
                    size="small" 
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, bgcolor: 'background.default' }}>
                <Typography variant="h4" color="primary" gutterBottom>
                  ${product.price.toFixed(2)}
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Availability:
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color={product.stock_quantity > 0 ? 'success.main' : 'error.main'}
                  >
                    {product.stock_quantity > 0 
                      ? `${product.stock_quantity} in stock` 
                      : 'Out of stock'}
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    disabled={product.stock_quantity <= 0}
                  >
                    Add to Cart
                  </Button>
                  
                  {isAuthenticated && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Button 
                        startIcon={<EditIcon />}
                        onClick={handleEdit}
                        sx={{ flex: 1, mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button 
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleDelete}
                        sx={{ flex: 1 }}
                      >
                        Delete
                      </Button>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProductDetail;
