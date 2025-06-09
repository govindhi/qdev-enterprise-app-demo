import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Paper
} from '@mui/material';
import { productApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = ({ isAdmin = false }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    categories: {},
    averagePrice: 0,
    lowStock: []
  });
  const { isAuthenticated, currentUser } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productApi.getAll();
        setProducts(data);
        
        // Calculate statistics
        const categories = {};
        let totalPrice = 0;
        const lowStock = [];
        
        data.forEach(product => {
          // Count categories
          categories[product.category] = (categories[product.category] || 0) + 1;
          
          // Sum prices for average
          totalPrice += product.price;
          
          // Check for low stock
          if (product.stock_quantity < 10) {
            lowStock.push(product);
          }
        });
        
        setStats({
          totalProducts: data.length,
          categories,
          averagePrice: data.length ? (totalPrice / data.length).toFixed(2) : 0,
          lowStock
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
      </Typography>
      
      {isAuthenticated && (
        <Typography variant="subtitle1" gutterBottom>
          Welcome back, {currentUser?.username || 'User'}!
        </Typography>
      )}
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Product Summary" />
            <Divider />
            <CardContent>
              <Typography variant="h3" align="center">
                {stats.totalProducts}
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center">
                Total Products
              </Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Average Price: ${stats.averagePrice}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Categories" />
            <Divider />
            <CardContent>
              <List dense>
                {Object.entries(stats.categories).map(([category, count]) => (
                  <ListItem key={category}>
                    <ListItemText 
                      primary={category} 
                      secondary={`${count} products`} 
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader 
              title="Low Stock Alert" 
              subheader="Products with less than 10 items in stock"
            />
            <Divider />
            <CardContent>
              {stats.lowStock.length > 0 ? (
                <List dense>
                  {stats.lowStock.map(product => (
                    <ListItem key={product.id}>
                      <ListItemText 
                        primary={product.name} 
                        secondary={`Stock: ${product.stock_quantity}`} 
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No products with low stock
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Products */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Products
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {products.slice(0, 4).map(product => (
                <Grid item xs={12} sm={6} md={3} key={product.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" noWrap>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" noWrap>
                        {product.description}
                      </Typography>
                      <Typography variant="h6" sx={{ mt: 1 }}>
                        ${product.price.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Category: {product.category}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
