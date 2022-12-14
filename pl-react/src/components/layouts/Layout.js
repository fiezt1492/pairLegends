import React from "react";
import { CssBaseline, Box, Paper } from "@mui/material";
import { Outlet } from "react-router";
import ResponsiveAppBar from "./AppBar";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useLocation } from "react-router-dom";
import { appRoutes } from "../../AppRoutes";
import LinkRouter from "../LinkRouter";
import PreloadLayout from "./PreloadLayout";

export function Layout() {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x) => x);

    const breadcrumbNameMap = {};
    appRoutes
        .filter((route) => !route.index)
        .forEach((route) => (breadcrumbNameMap[route.path] = route.name));

    return (
        <PreloadLayout>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "80vh",
                }}
            >
                <CssBaseline />
                <header>
                    <ResponsiveAppBar />
                </header>
                <main>
                    <Box sx={{ pt: 2, pb: 2 }}>
                        <Container>
                            <Box sx={{ pb: 2 }}>
                                <Breadcrumbs aria-label="breadcrumb">
                                    <LinkRouter underline="hover" color="inherit" to="/">
                                        Home
                                    </LinkRouter>
                                    {pathnames.map((value, index) => {
                                        const last = index === pathnames.length - 1;
                                        const to = `/${pathnames.slice(0, index + 1).join("/")}`;

                                        return last ? (
                                            <Typography color="text.primary" key={to}>
                                                {breadcrumbNameMap[to]}
                                            </Typography>
                                        ) : (
                                            <LinkRouter
                                                underline="hover"
                                                color="inherit"
                                                to={to}
                                                key={to}
                                            >
                                                {breadcrumbNameMap[to]}
                                            </LinkRouter>
                                        );
                                    })}
                                </Breadcrumbs>
                            </Box>
                            <Paper>
                                <Box p={2}>
                                    <Outlet />
                                </Box>
                            </Paper>
                        </Container>
                    </Box>
                </main>
            </Box>
        </PreloadLayout>
    );
}
