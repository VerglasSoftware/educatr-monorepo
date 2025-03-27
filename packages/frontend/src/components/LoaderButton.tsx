import Button from "react-bootstrap/Button";
import { BsArrowRepeat } from "react-icons/bs";
import "./LoaderButton.css";

export default function LoaderButton({ disabled = false, isLoading = false, ...props }) {
	return (
		<Button
			disabled={disabled || isLoading}
			{...props}>
			{isLoading && <BsArrowRepeat className="spinning" />}
			{props.children}
		</Button>
	);
}
