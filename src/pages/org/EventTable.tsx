import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { OrgEvent } from '../../managers/EventManager';
import { useNavigate } from 'react-router-dom';

function EventTable({ events }: { events: OrgEvent[] }) {
	const navigation = useNavigate();

	return (
		<TableContainer component={Paper}>
			<Table sx={{ minWidth: 650 }} aria-label="simple table">
				<TableHead>
					<TableRow>
						<TableCell>Name</TableCell>
						{/* <TableCell>Email</TableCell>
            <TableCell align="right">Timestamp</TableCell> */}
					</TableRow>
				</TableHead>
				<TableBody>
					{events.map((event) => (
						<TableRow
							hover
							key={event.name}
							sx={{ '&:last-child td, &:last-child th': { border: 0, cursor: 'pointer' } }}
							onClick={() => navigation('events/' + event.id)}
						>
							<TableCell component="th" scope="row">
								{event.name}
							</TableCell>
							{/* <TableCell align="right">{event.timestamp.toString()}</TableCell> */}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}

export default EventTable;
