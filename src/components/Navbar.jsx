import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import RestoreIcon from "@mui/icons-material/Restore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useState } from "react";
import { Link, matchPath, useLocation } from "react-router";
import { Paper } from "@mui/material";

function useRouteMatch(patterns) {
  const { pathname } = useLocation();
  for (let i = 0; i < patterns.length; i += 1) {
    const pattern = patterns[i];
    const possibleMatch = matchPath(pattern, pathname);
    if (possibleMatch !== null) {
      return possibleMatch;
    }
  }
  return null;
}

export default function Navbar() {
  const routeMatch = useRouteMatch(["/recents", "/recents/:id", "/"]);
  const currentTab = routeMatch?.pattern?.path;

  return (
    <Paper
      sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
      elevation={3}
    >
      <Box>
        <BottomNavigation showLabels value={currentTab}>
          <BottomNavigationAction
            label="New Trip"
            value="/"
            to="/"
            component={Link}
            icon={<FavoriteIcon />}
          />
          <BottomNavigationAction
            label="Recents"
            value="/recents"
            to="/recents"
            component={Link}
            icon={<RestoreIcon />}
          />
        </BottomNavigation>
      </Box>
    </Paper>
  );
}
