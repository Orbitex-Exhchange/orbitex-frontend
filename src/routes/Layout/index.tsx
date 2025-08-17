import * as React from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { minutesUntilAutoLogout } from '../../api';
import { WalletsFetch } from '../../containers';
import { toggleColorTheme } from '../../helpers';
import {
    ChangeForgottenPasswordScreen,
    ConfirmScreen,
    EmailVerificationScreen,
    ForgotPasswordScreen,
    HistoryScreen,
    OrdersTabScreen,
    ProfileScreen,
    ProfileTwoFactorAuthScreen,
    SignInScreen,
    SignUpScreen,
    TradingScreen,
    VerificationScreen,
    WalletsScreen,
} from '../../screens';
import { useUIState } from '../../store/calculationsStore';
import { useBusinessStore } from '../../store/businessStore';

const renderLoader = () => (
    <div className="pg-loader-container">
        <div>Loading...</div>
    </div>
);

const CHECK_INTERVAL = 15000;
const STORE_KEY = 'lastAction';

//tslint:disable-next-line no-any
const PrivateRoute: React.FunctionComponent<any> = ({ component: CustomComponent, loading, isLogged, ...rest }) => {
    if (loading) {
        return renderLoader();
    }

    if (isLogged) {
        return <Route {...rest} element={<CustomComponent />} />;
    }

    return <Navigate to="/signin" replace />;
};

//tslint:disable-next-line no-any
const PublicRoute: React.FunctionComponent<any> = ({ component: CustomComponent, loading, isLogged, ...rest }) => {
    if (loading) {
        return renderLoader();
    }

    if (isLogged) {
        return <Navigate to="/wallets" replace />;
    }

    return <Route {...rest} element={<CustomComponent />} />;
};

// ===== MODERN STATE MANAGEMENT COMPONENT =====

const LayoutComponent: React.FC = () => {
    const navigate = useNavigate();
    const { theme } = useUIState();
    const { user, isAuthenticated, logout } = useBusinessStore();

    // Mock loading state for now
    const userLoading = false;

    // Auto-logout functionality
    const getLastAction = React.useCallback(() => {
        if (localStorage.getItem(STORE_KEY) !== null) {
            return parseInt(localStorage.getItem(STORE_KEY) || '0', 10);
        }
        return 0;
    }, []);

    const setLastAction = React.useCallback((lastAction: number) => {
        localStorage.setItem(STORE_KEY, lastAction.toString());
    }, []);

    const reset = React.useCallback(() => {
        setLastAction(Date.now());
    }, [setLastAction]);

    const check = React.useCallback(() => {
        const now = Date.now();
        const timeleft = getLastAction() + parseFloat(minutesUntilAutoLogout()) * 60 * 1000;
        const diff = timeleft - now;
        const isTimeout = diff < 0;
        if (isTimeout && user?.email) {
            logout();
        }
    }, [getLastAction, logout, user?.email]);

    // Event listeners for auto-logout
    React.useEffect(() => {
        const eventsListen = [
            'click',
            'keydown',
            'scroll',
            'resize',
            'mousemove',
            'TabSelect',
            'TabHide',
        ];

        reset();
        eventsListen.forEach(type => {
            document.body.addEventListener(type, reset);
        });

        const timer = setInterval(() => {
            check();
        }, CHECK_INTERVAL);

        return () => {
            eventsListen.forEach(type => {
                document.body.removeEventListener(type, reset);
            });
            clearInterval(timer);
        };
    }, [reset, check]);

    // Handle authentication state changes
    React.useEffect(() => {
        if (isAuthenticated && !window.location.pathname.includes('/trading')) {
            navigate('/trading/');
        }
    }, [isAuthenticated, navigate]);

    // Apply theme
    React.useEffect(() => {
        toggleColorTheme(theme);
    }, [theme]);

    const tradingCls = window.location.pathname.includes('/trading') ? 'trading-layout' : '';

    return (
        <div className={`container-fluid pg-layout ${tradingCls}`}>
            <Routes>
                <Route path="/signin" element={<PublicRoute loading={userLoading} isLogged={isAuthenticated} component={SignInScreen} />} />
                <Route path="/accounts/confirmation" element={<PublicRoute loading={userLoading} isLogged={isAuthenticated} component={VerificationScreen} />} />
                <Route path="/signup" element={<PublicRoute loading={userLoading} isLogged={isAuthenticated} component={SignUpScreen} />} />
                <Route path="/forgot_password" element={<PublicRoute loading={userLoading} isLogged={isAuthenticated} component={ForgotPasswordScreen} />} />
                <Route path="/accounts/password_reset" element={<PublicRoute loading={userLoading} isLogged={isAuthenticated} component={ChangeForgottenPasswordScreen} />} />
                <Route path="/email-verification" element={<PublicRoute loading={userLoading} isLogged={isAuthenticated} component={EmailVerificationScreen} />} />
                <Route path="/trading/:market?" element={<TradingScreen />} />
                <Route path="/orders" element={<PrivateRoute loading={userLoading} isLogged={isAuthenticated} component={OrdersTabScreen} />} />
                <Route path="/history" element={<PrivateRoute loading={userLoading} isLogged={isAuthenticated} component={HistoryScreen} />} />
                <Route path="/confirm" element={<PrivateRoute loading={userLoading} isLogged={isAuthenticated} component={ConfirmScreen} />} />
                <Route path="/profile" element={<PrivateRoute loading={userLoading} isLogged={isAuthenticated} component={ProfileScreen} />} />
                <Route path="/wallets" element={<PrivateRoute loading={userLoading} isLogged={isAuthenticated} component={WalletsScreen} />} />
                <Route path="/security/2fa" element={<PrivateRoute loading={userLoading} isLogged={isAuthenticated} component={ProfileTwoFactorAuthScreen} />} />
                <Route path="*" element={<Navigate to="/trading/" replace />} />
            </Routes>
            {isAuthenticated && <WalletsFetch/>}
        </div>
    );
};

// ===== EXPORT =====

export const Layout = LayoutComponent;
