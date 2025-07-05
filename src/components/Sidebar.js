import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import BarChartIcon from '@mui/icons-material/BarChart';
import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 220;

// تعريف القائمة خارج المكون لتحسين الأداء
const menu = [
  { text: ' الطلبات و الادارة', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'المخزون', icon: <InventoryIcon />, path: '/inventory' },
  { text: 'التقارير', icon: <BarChartIcon />, path: '/reports' },
];

// استخدام React.memo لتقليل إعادة التصيير
const Sidebar = React.memo(function Sidebar() {
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
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname.startsWith(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
});

export default Sidebar;
