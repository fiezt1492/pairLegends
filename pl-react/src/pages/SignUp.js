import * as React from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import { useForm } from "react-hook-form";
import {
    FormContainer,
    TextFieldElement,
    PasswordElement,
    PasswordRepeatElement,
} from "react-hook-form-mui";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import { ReactComponent as DiscordSvg } from "../assets/svg/discord.svg";
import SvgIcon from "@mui/material/SvgIcon";
import { useSnackbar } from "notistack";
import LinkRouter from "../components/LinkRouter";
import LoadingButton from "@mui/lab/LoadingButton";
import { register } from "../utils/api";
import { validatePassword } from "../utils/index";

const DiscordIcon = () => <SvgIcon component={DiscordSvg} inheritViewBox />;

export function SignUp() {
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const formContext = useForm();
    const [loading, setLoading] = React.useState(false);

    const { handleSubmit } = formContext;

    const onSubmit = (submit, e) => {
        setLoading(true);
        const signUpModel = JSON.stringify({
            userName: `${submit.username}`,
            password: `${submit.password}`,
            confirmPassword: `${submit["password-repeat"]}`,
            email: `${submit.email}`,
        });

        register(signUpModel)
            .then((data) => {
                setLoading(false);
                SnackBar(`We've signed you up!`, "success")();
                navigate("/sign-in");
            })
            .catch((err) => {
                setLoading(false);
                SnackBar(`${err.message}`, "error")();
                console.error(err.message);
            });
    };

    const onError = (error, e) => {
        console.error(error);
        SnackBar(`${Object.keys(error).length} errors occured.`, "error")();
    };

    const SnackBar =
        (message, variant, ...props) =>
            () => {
                enqueueSnackbar(message, {
                    variant,
                    ...props,
                });
            };

    const inDevelopment = SnackBar("This feature is in development.", "warning");

    return (
        <div>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign up
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                        <FormContainer
                            formContext={formContext}
                            handleSubmit={handleSubmit(onSubmit, onError)}
                            FormProps={{
                                "aria-autocomplete": "none",
                                autoComplete: "new-password",
                            }}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextFieldElement
                                        name="username"
                                        id="username"
                                        label="Username"
                                        autoFocus
                                        required
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextFieldElement
                                        id="email"
                                        type="email"
                                        label="Email Address"
                                        name="email"
                                        autoComplete="email"
                                        required
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <PasswordElement
                                        name="password"
                                        label="Password"
                                        id="password"
                                        autoComplete="new-password"
                                        required
                                        fullWidth
                                        validation={{
                                            validate: (value) => validatePassword(value),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <PasswordRepeatElement
                                        passwordFieldName="password"
                                        name="password-repeat"
                                        margin="dense"
                                        label="Repeat Password"
                                        required
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                            <LoadingButton
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                loading={loading}
                            >
                                Sign Up
                            </LoadingButton>
                        </FormContainer>
                        <Divider>or</Divider>
                        <Stack direction="row" spacing={2} sx={{ mt: 2, mb: 3 }}>
                            <Button
                                startIcon={<GoogleIcon />}
                                fullWidth
                                variant="contained"
                                onClick={inDevelopment}
                            >
                                Google
                            </Button>
                            <Button
                                startIcon={<GitHubIcon />}
                                fullWidth
                                variant="contained"
                                onClick={inDevelopment}
                            >
                                Github
                            </Button>
                            <Button
                                startIcon={<DiscordIcon />}
                                fullWidth
                                variant="contained"
                                onClick={inDevelopment}
                            >
                                Discord
                            </Button>
                        </Stack>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <LinkRouter to="/sign-in" variant="body2">
                                    Already have an account? Sign in
                                </LinkRouter>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </div>
    );
}
