import React, { useEffect, useState } from 'react';
import Modal from '../../_design/components/alerts/Modal';
import { API } from 'aws-amplify';
import { Pack } from '../../../../functions/src/types/pack';
import Loader from '../../_design/components/core/Loader';
import Text from '../../_design/components/core/Text';
import Input from '../../_design/components/form/Input';
import Button from '../../_design/components/core/Button';

interface EditPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  packId: string;
}

const EditPackModal: React.FC<EditPackModalProps> = ({ isOpen, onClose, packId }) => {
    const [pack, setPack] = useState<Pack | null>(null);
    const [saveLoading, setSaveLoading] = useState(false);

    const handleSave = async () => {
        setSaveLoading(true);

        console.log((document.getElementsByName("name")[0] as HTMLInputElement).value);

        try {
            await API.put("api", `/pack/${packId}`, {
                body: {
                    ...pack,
                    name: (document.getElementsByName("name")[0] as HTMLInputElement).value,
                    description: (document.getElementsByName("description")[0] as HTMLInputElement).value,
                }
            });
            onClose();
        } finally {
            setSaveLoading(false);
        }
    };

    useEffect(() => {
        async function fetchPack() {
            setPack(null);
            const pack: Pack = await API.get("api", `/pack/${packId}`, {});
            setPack(pack);
        }
        if (isOpen) {
            fetchPack();
        }
    }
    , [isOpen, packId]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} closeOnBackdropClick>
        <Modal.Header>
            <Text variant="h3" noMargin>Edit {pack && pack.name}</Text>
        </Modal.Header>
        <Modal.Body>
            {
                pack ? (
                    <div className="flex flex-col gap-2">
                        <Input name="name" label="Name" defaultValue={pack.name} />
                        <Input name="description" label="Description" defaultValue={pack.description} textarea rows={2} />
                    </div>
                ) : (
                    <Loader size={20} />
                )
            }
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={onClose} colorScheme="secondary">Cancel</Button>
            <Button onClick={handleSave} colorScheme="success" loading={saveLoading} disabled={!pack}>Save</Button>
        </Modal.Footer>
        </Modal>
    );
};

export default EditPackModal;
