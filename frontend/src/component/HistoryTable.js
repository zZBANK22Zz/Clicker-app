import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";

const HistoryTable = ({ history }) => {
  console.log("History Data in Table:", history);
  return (
    <Table aria-label="Example empty table">
      <TableHeader>
        <TableColumn>Date/Time </TableColumn>
        <TableColumn>Event Type</TableColumn>
        <TableColumn>Current Value</TableColumn>
      </TableHeader>
      <TableBody emptyContent={"No rows to display."}>
        {history.map((item, index) => (
          <TableRow key={index}>
            <TableCell className="text-center">
              {new Date(item.timestamp).toLocaleString()}
            </TableCell>
            <TableCell className="text-center">{item.eventType}</TableCell>
            <TableCell className="text-center">{item.currentValue}</TableCell>
          </TableRow>
        ))}
      </TableBody>{" "}
    </Table>
  );
};

export default HistoryTable;
