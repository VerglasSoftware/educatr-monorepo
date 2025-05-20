import { Box, Typography } from "@mui/joy";
import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import { Class } from "../../../../functions/src/types/class";
import { Organisation } from "../../../../functions/src/types/organisation";
import Breadcrumb from "../../components/dash/breadcrumb";
import ClassCard from "../../components/dash/organisations/ClassCard";

export default function ClassDetail() {
	const { orgId, classId } = useParams();

	const [org, setOrg] = useState<Organisation>();
	const [clazz, setClass] = useState<Class>();
	const [name, setName] = useState<string>("");

	useEffect(() => {
		async function onLoad() {
			try {
				const org = await API.get("api", `/organisation/${orgId}`, {});
				setOrg(org);
				const clazz = await API.get("api", `/organisation/${orgId}/class/${classId}`, {});
				setClass(clazz);
				setName(clazz.name);
			} catch (e) {
				console.log(e);
			}
		}

		onLoad();
	}, []);

	return (
		org &&
		clazz && (
			<div className="Home">
				<Helmet>
					<title>{clazz.name} - Classes</title>
				</Helmet>
				<div>
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<Breadcrumb
							items={[
								{ label: "Dashboard", href: "/dash" },
								{ label: org.name, href: `/dash/${orgId}` },
								{ label: "Classes", href: `/dash/${orgId}/classes` },
								{ label: clazz.name, href: `/dash/${orgId}/classes/${classId}` },
							]}
						/>
					</Box>

					<Box
						sx={{
							display: "flex",
							mb: 1,
							gap: 1,
							flexDirection: { xs: "column", sm: "row" },
							alignItems: { xs: "start", sm: "center" },
							flexWrap: "wrap",
							justifyContent: "space-between",
						}}>
						<Typography
							level="h2"
							component="h1">
							{clazz.name}
						</Typography>
					</Box>

					<Box sx={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 2 }}>
						<Box sx={{ gridColumn: "span 6" }}>
							<ClassCard
								orgId={orgId}
								name={name}
								setName={setName}
								clazz={clazz}
								setClass={setClass}
							/>
						</Box>
					</Box>
				</div>
			</div>
		)
	);
}
