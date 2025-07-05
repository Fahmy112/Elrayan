import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InventoryIcon from '@mui/icons-material/Inventory';
import BarChartIcon from '@mui/icons-material/BarChart';
import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 220;

const menu = [
  { text: 'لوحة التحكم', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'العملاء', icon: <PeopleIcon />, path: '/clients' },
  { text: 'السيارات', icon: <DirectionsCarIcon />, path: '/cars' },
  { text: 'الطلبات', icon: <AssignmentIcon />, path: '/orders' },
  { text: 'المخزون', icon: <InventoryIcon />, path: '/inventory' },
  { text: 'التقارير', icon: <BarChartIcon />, path: '/reports' },
];

export default function Sidebar() {
  const location = useLocation();
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', background: '#fff' },
      }}
    >
      <Toolbar />
      <List>
        {menu.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
