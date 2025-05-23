import { API, Auth } from "aws-amplify";
import { ReactElement, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppContext } from "../lib/contextLib";
import LoadingPage from "../_design/components/navigation/LoadingPage";

interface ProtectedRouteProps {
	children: ReactElement;
	requiredRole: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps): ReactElement {
	const { pathname, search } = useLocation();
	const { isAuthenticated } = useAppContext();
	const [userRole, setUserRole] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchUserRole = async () => {
			try {
				const user = await Auth.currentAuthenticatedUser();
				setUserRole(user.attributes["custom:role"] || "USER");
			} catch (error) {
				console.error("Error fetching authenticated user", error);
				setUserRole(null);
			} finally {
				setLoading(false);
			}
		};

		if (isAuthenticated) {
			fetchUserRole();
		} else {
			setLoading(false);
		}
	}, [isAuthenticated]);

	if (loading) {
		return <LoadingPage />;
	}

	if (!isAuthenticated) {
		return <Navigate to={`/login?redirect=${pathname}${search}`} />;
	}

	if (userRole !== requiredRole) {
		return <Navigate to="/" />;
	}

	return children;
}
