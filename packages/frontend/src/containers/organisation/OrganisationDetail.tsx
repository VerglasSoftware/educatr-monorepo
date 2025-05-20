import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Organisation } from "../../../../functions/src/types/organisation";
import Page from "../../_design/components/layout/Page";
import SidebarDash from "../../components/SidebarDash";
import { useAppContext } from "../../lib/contextLib";
import Container from "../../_design/components/layout/Container";
import Breadcrumbs from "../../_design/components/navigation/Breadcrumbs";
import Text from "../../_design/components/core/Text";
import Loader from "../../_design/components/core/Loader";
import { Tab, Tabs } from "../../_design/components/layout/Tabs";
import Table from "../../_design/components/core/Table";
import { User } from "../../../../functions/src/types/user";
import EditOrganisationModal from "../../modals/dash/EditOrganisationModal";
import Button from "../../_design/components/core/Button";
import { IoAdd, IoPencil } from "react-icons/io5";
import CreateStudentModal from "../../modals/dash/CreateStudentModal";

export default function OrganisationDetail() {
	const [organisation, setOrganisation] = useState<Organisation>();
	const [students, setStudents] = useState<User[]>([]);

	const [editOrganisationModalOpen, setEditOrganisationModalOpen] = useState(false);
	const [newStudentModalOpen, setNewStudentModalOpen] = useState(false);

	const { id } = useParams();

	useEffect(() => {
		async function onLoad() {
			try {
				const organisation = await API.get("api", `/organisation/${id}`, {});
				const students = await API.get("api", `/organisation/${id}/students`, {});
				setOrganisation(organisation);
				setStudents(students);
			} catch (e) {
				console.log(e);
			}
		}

		onLoad();
	}, []);

	return (
			<Page title={`${organisation && organisation.name}`} sidebar={<SidebarDash />} useAuthContext={useAppContext}>
				<Container>
					<Breadcrumbs
						items={[
							{ label: "Dashboard", href: "/dash" },
							{ label: organisation && organisation.name }
						]}
					/>
					<div className="flex items-center">
						<Text variant="title" as="h1">{organisation && organisation.name}</Text>
						<Button variant="text" size="large" onClick={() => { setEditOrganisationModalOpen(true) }}>
							<IoPencil className="text-primary" />
						</Button>
					</div>

					{
						!organisation ? (
							<Loader />
						) : (
							<Tabs>
								<Tab id="students" label="Students">
									<div className="flex items-center justify-end">
										<Button preIcon={<IoAdd />} onClick={() => setNewStudentModalOpen(true)}>Create student</Button>
									</div>
									<Table loading={!students}>
										<Table.Head>
											<Table.Row>
												<Table.Cell>Name</Table.Cell>
												<Table.Cell>Username</Table.Cell>
												<Table.Cell>{''}</Table.Cell>
											</Table.Row>
										</Table.Head>
										<Table.Body>
											{students.map((student) => (
												<Table.Row key={student.id}>
													<Table.Cell><img src={student.picture} /> {student.given_name} {student.family_name}</Table.Cell>
													<Table.Cell>{student.id}</Table.Cell>
													<Table.Cell>...</Table.Cell>
												</Table.Row>
											))}
										</Table.Body>
									</Table>
								</Tab>
							</Tabs>
						)
					}

					<EditOrganisationModal isOpen={editOrganisationModalOpen} onClose={() => { setEditOrganisationModalOpen(false) }} organisationId={id} />
					<CreateStudentModal isOpen={newStudentModalOpen} onClose={() => { setNewStudentModalOpen(false) }} organisationId={id} />
				</Container>
			</Page>
	);
}
