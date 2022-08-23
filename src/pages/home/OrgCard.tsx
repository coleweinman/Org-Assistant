import React from "react";
import { useNavigate } from "react-router-dom";
import { Org } from "../../managers/OrgManager";
import "../../stylesheets/OrgCard.scss";

type OrgCardProps = {
	org: Org
}

const OrgCard: React.FC<OrgCardProps> = ({ org }) => {
	const navigate = useNavigate();
	const navigateToOrg = () => navigate(`orgs/${org.id}`);
	return (
		<div className={"org-card"} onClick={navigateToOrg}>
			<h3 className={"org-name"}>{org.name}</h3>
		</div>
	);
}

export default OrgCard;