import { Card, CardActionArea, CardActions, CardContent, CardMedia, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { Org } from "../../managers/OrgManager";

function OrgCard({ org }: { org: Org }) {
	return (
		<Card sx={{ maxWidth: 345 }}>
			<CardActionArea component={Link} to={"orgs/" + org.id}>
				{/* <CardMedia
					component="img"
					height="140"
					image="/static/images/cards/contemplative-reptile.jpg"
					alt="green iguana"
				/> */}
				<CardContent>
					<Typography gutterBottom variant="h5" component="div">
						{org.name}
					</Typography>
					{/* <Typography variant="body2" color="text.secondary">
						Lizards are a widespread group of squamate reptiles, with over 6,000
						species, ranging across all continents except Antarctica
					</Typography> */}
				</CardContent>
			</CardActionArea>
		</Card>
	);
}

export default OrgCard;