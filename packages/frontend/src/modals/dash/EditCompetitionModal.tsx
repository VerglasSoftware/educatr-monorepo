import React, { useEffect, useState } from 'react';
import Modal from '../../_design/components/alerts/Modal';
import { API } from 'aws-amplify';
import { Competition } from '../../../../functions/src/types/competition';
import Loader from '../../_design/components/core/Loader';
import Text from '../../_design/components/core/Text';
import Input from '../../_design/components/form/Input';
import Button from '../../_design/components/core/Button';

interface EditCompetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  competitionId: string;
}

const EditCompetitionModal: React.FC<EditCompetitionModalProps> = ({ isOpen, onClose, competitionId }) => {
    const [competition, setCompetition] = useState<Competition | null>(null);
    const [saveLoading, setSaveLoading] = useState(false);

    const handleSave = async () => {
        setSaveLoading(true);

        console.log((document.getElementsByName("name")[0] as HTMLInputElement).value);

        try {
            await API.put("api", `/competition/${competitionId}`, {
                body: {
                    ...competition,
                    name: (document.getElementsByName("name")[0] as HTMLInputElement).value,
                }
            });
            onClose();
        } finally {
            setSaveLoading(false);
        }
    };

    useEffect(() => {
        async function fetchCompetition() {
            setCompetition(null);
            const competition: Competition = await API.get("api", `/competition/${competitionId}`, {});
            setCompetition(competition);
        }
        if (isOpen) {
            fetchCompetition();
        }
    }
    , [isOpen, competitionId]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} closeOnBackdropClick>
        <Modal.Header>
            <Text variant="h3" noMargin>Edit {competition && competition.name}</Text>
        </Modal.Header>
        <Modal.Body>
            {
                competition ? (
                    <div className="flex flex-col gap-2">
                        <Input name="name" label="Name" defaultValue={competition.name} />
                    </div>
                ) : (
                    <Loader size={20} />
                )
            }
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={onClose} colorScheme="secondary">Cancel</Button>
            <Button onClick={handleSave} colorScheme="success" loading={saveLoading} disabled={!competition}>Save</Button>
        </Modal.Footer>
        </Modal>
    );
};

export default EditCompetitionModal;
