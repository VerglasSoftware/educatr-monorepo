import React, { useEffect, useState } from 'react';
import Container from '../_design/components/layout/Container';
import Text from '../_design/components/core/Text';
import { IoAddCircle, IoBook, IoPieChart, IoTrophy } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { Organisation } from '../../../functions/src/types/organisation';
import { API } from 'aws-amplify';

const SidebarDash: React.FC = () => {
    const [organisations, setOrganisations] = useState<Organisation[]>([]);

    useEffect(() => {
        async function onLoad() {
            try {
                const organisations: Organisation[] = await API.get("api", "/organisation", {});
                setOrganisations(organisations);
            } catch (e) {
                console.log(e);
            }
        }

        onLoad();
    }, []);

  return (
    <Container>
        <ul className="space-y-2 font-medium">
            <li>
            <Link to={{ pathname: '/dash' }} className="flex items-center p-2 text-gray-900 rounded-sm hover:bg-gray-100 group">
                    <IoPieChart size="1.3em" className="me-2 transition duration-75 group-hover:text-primary text-primary/70" />
                    <Text fontWeight="semibold" noMargin>Dashboard</Text>
            </Link>
            <Link to={{ pathname: '/dash/packs' }} className="flex items-center p-2 text-gray-900 rounded-sm hover:bg-gray-100 group">
                <IoBook size="1.3em" className="me-2 transition duration-75 group-hover:text-primary text-primary/70" />
                <Text fontWeight="semibold" noMargin>Packs</Text>
            </Link>
            <Link to={{ pathname: '/dash/competitions' }} className="flex items-center p-2 text-gray-900 rounded-sm hover:bg-gray-100 group">
                <IoTrophy size="1.3em" className="me-2 transition duration-75 group-hover:text-primary text-primary/70" />
                <Text fontWeight="semibold" noMargin>Competitions</Text>
            </Link>
            </li>
        </ul>
        {
            organisations.map((organisation) => (
                <ul className="space-y-2 font-medium border-t border-gray-200 pt-4 mt-4" key={organisation.id}>
                    <Text variant="tiny" noMargin>{organisation.name}</Text>
                    <li>
                    <Link to={{ pathname: `/dash/org/${organisation.id}` }} className="flex items-center p-2 text-gray-900 rounded-sm hover:bg-gray-100 group">
                            <IoPieChart size="1.3em" className="me-2 transition duration-75 group-hover:text-primary text-primary/70" />
                            <Text fontWeight="semibold" noMargin>Dashboard</Text>
                    </Link>
                    </li>
                </ul>
            ))
        }
        <ul className="space-y-2 font-medium border-t border-gray-200 pt-4 mt-4">
            <li>
            <button className="flex items-center p-2 text-gray-900 rounded-sm hover:bg-gray-100 group w-full" onClick={async () => {
                const response = await API.post("api", "/billing/organisation/request", { body: { url: window.location.protocol + "//" + window.location.host } });
                const { url } = response;
                window.location.href = url;
            }}>
                    <IoAddCircle size="1.3em" className="me-2 transition duration-75 group-hover:text-primary text-primary/70" />
                    <Text fontWeight="semibold" noMargin>Create org.</Text>
            </button>
            </li>
        </ul>
    </Container>
  );
};

export default SidebarDash;
