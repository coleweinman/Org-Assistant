import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { CheckIn } from '../../managers/CheckInManager';
import { Typography } from '@mui/material';

function CheckInTable({ checkIns } : { checkIns: CheckIn[] }) {
  return (
    <TableContainer component={Paper}>
      <Typography variant="h5" sx={{ padding: "8px", paddingTop: "16px", textAlign: "center" }}>Check Ins</Typography>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell align="right">Timestamp</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {checkIns.map((checkIn) => (
            <TableRow
              hover
              key={checkIn.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
							<TableCell component="th" scope="row">
                {checkIn.name}
              </TableCell>
              <TableCell component="th" scope="row">
                {checkIn.email}
              </TableCell>
              <TableCell align="right">{checkIn.timestamp.toDate().toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default CheckInTable;
