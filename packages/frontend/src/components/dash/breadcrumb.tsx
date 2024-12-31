import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import { Breadcrumbs, Link, Typography } from "@mui/joy";

type BreadcrumbItem = {
	label: string;
	href: string;
};

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
	return (
		<Breadcrumbs
			size="sm"
			aria-label="breadcrumbs"
			separator={<ChevronRightRoundedIcon fontSize="small" />}
			sx={{ pl: 0 }}>
			<Link
				underline="none"
				color="neutral"
				href="/"
				aria-label="Home">
				<HomeRoundedIcon />
			</Link>
			{items.map(({ label, href }, index) => {
				const isLast = index === items.length - 1;
				return isLast ? (
					<Typography
						key={href}
						color="primary"
						sx={{ fontWeight: 500, fontSize: 12 }}>
						{label}
					</Typography>
				) : (
					<Link
						key={href}
						underline="hover"
						color="neutral"
						href={href}
						sx={{ fontSize: 12, fontWeight: 500 }}>
						{label}
					</Link>
				);
			})}
		</Breadcrumbs>
	);
}
