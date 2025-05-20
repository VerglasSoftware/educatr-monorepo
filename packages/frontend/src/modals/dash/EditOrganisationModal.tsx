import React, { useEffect, useState } from 'react';
import Modal from '../../_design/components/alerts/Modal';
import { API } from 'aws-amplify';
import Loader from '../../_design/components/core/Loader';
import Text from '../../_design/components/core/Text';
import Input from '../../_design/components/form/Input';
import Button from '../../_design/components/core/Button';
import { Organisation } from '../../../../functions/src/types/organisation';

interface EditOrganisationModalProps {
  isOpen: boolean;
  onClose: () => void;
  organisationId: string;
}

const EditOrganisationModal: React.FC<EditOrganisationModalProps> = ({ isOpen, onClose, organisationId }) => {
    const [organisation, setOrganisation] = useState<Organisation | null>(null);
    const [saveLoading, setSaveLoading] = useState(false);

    const handleSave = async () => {
        setSaveLoading(true);

        console.log((document.getElementsByName("name")[0] as HTMLInputElement).value);

        try {
            await API.put("api", `/organisation/${organisationId}`, {
                body: {
                    ...organisation,
                    name: (document.getElementsByName("name")[0] as HTMLInputElement).value,
                    logo: null,
                }
            });
            onClose();
        } finally {
            setSaveLoading(false);
        }
    };

    useEffect(() => {
        async function fetchPack() {
            setOrganisation(null);
            const organisation: Organisation = await API.get("api", `/organisation/${organisationId}`, {});
            setOrganisation(organisation);
        }
        if (isOpen) {
            fetchPack();
        }
    }
    , [isOpen, organisationId]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} closeOnBackdropClick>
        <Modal.Header>
            <Text variant="h3" noMargin>Edit {organisation && organisation.name}</Text>
        </Modal.Header>
        <Modal.Body>
            {
                organisation ? (
                    <div className="flex flex-col gap-2">
                        <Input name="name" label="Name" defaultValue={organisation.name} />
                    </div>
                ) : (
                    <Loader size={20} />
                )
            }
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={onClose} colorScheme="secondary">Cancel</Button>
            <Button onClick={handleSave} colorScheme="success" loading={saveLoading} disabled={!organisation}>Save</Button>
        </Modal.Footer>
        </Modal>
    );
};

export default EditOrganisationModal;
