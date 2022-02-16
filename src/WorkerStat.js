import * as React from 'react';
import Paper from '@mui/material/Paper';
import { Button, Chip, Container, Grid, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
  }

export default function WorkerStat() {

    const baseUrl = `https://api.ethermine.org/miner`
    const [wallet, setWallet] = React.useState('')  // `791D0b40490Eba6B00191f559aC7ed74bb3390D8`
    const [workers, setWorkers] = React.useState(null)
    const [summary, setSummary] = React.useState(null)
    const [searchParam, setSearchParam] = useSearchParams()

    React.useEffect(()=>{
        const query = searchParam.get("minerAddress")
        if (query)
            setWallet(query)
    }, [])

    async function fetch(){
        const res = await axios.get(`${baseUrl}/${wallet}/workers`)
        setWorkers(res.data.data)
    }

    function fetchHistory() {
        let tasks = workers.map(w => axios.get(`${baseUrl}/${wallet}/worker/${w.worker}/history`))
        Promise.all(tasks).then( res => {           
            let output = workers.map( w => {
                let stat = { workerName: w.worker, count: 0, validShares: 0, invalidShares: 0, firstSeen: null, lastSeen: null }
                return stat
            })
            res.forEach((element, index)=>{
                let firstTime = Infinity
                let lastTime = -1

                element.data.data.forEach( record => {
                    output[index].count += 1
                    output[index].validShares += record.validShares
                    output[index].invalidShares += record.invalidShares
                    if (record.time > lastTime)
                        lastTime = record.time

                    if (record.time < firstTime)
                        firstTime = record.time
                })
                output[index].firstSeen = firstTime
                output[index].lastSeen = lastTime
            })
            setSummary(output)
        })
    }

    React.useEffect(()=>{
        if (!workers)
            return;
        fetchHistory()
    }, [workers])

    return (
        <Container maxWidth="md">
            <Paper elevation={3} style={{ padding: "4rem", flexDirection: "column", justifyContent:"center" }}>
            <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="center" spacing={3}
                >
                <Grid item>
                    <Typography variant='h4' gutterBottom>Ethermine Worker Stat Analysis</Typography>
                    <Typography variant='overline'>v0.1 Updated on 2/16/2022</Typography>
                </Grid>
                <Grid item>
                    <Grid container alignItems="center" spacing={3}>
                        <Grid item>
                            <TextField id="filled-basic" label="Miner Address" variant="filled" value={wallet}/>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" onClick={fetch}>Load Data</Button>
                        </Grid>
                    </Grid>
                </Grid>
                {workers && <Grid item>
                    <Stack direction = "row" spacing={1}>
                        {workers.map(w => 
                            <Chip label={w.worker} key={w.worker} variant="outlined"/>
                        )}
                    </Stack>
                </Grid>}
                {summary && <Grid item>
                    <TableContainer>
                        <Table sw={{minWidth: 650}} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Worker Name</TableCell>
                                    <TableCell>Record Count</TableCell>
                                    <TableCell>Valid Shares</TableCell>
                                    <TableCell>Invalid Shares</TableCell>
                                    <TableCell>First Date</TableCell>
                                    <TableCell>Last Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {summary.map(row => 
                                    <TableRow key={row.workerName} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">
                                            {row.workerName}
                                        </TableCell>
                                        <TableCell align="right">{row.count}</TableCell>
                                        <TableCell align="right">{row.validShares}</TableCell>
                                        <TableCell align="right">{row.invalidShares}</TableCell>
                                        <TableCell>{timeConverter(row.firstSeen)}</TableCell>
                                        <TableCell>{timeConverter(row.lastSeen)}</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>}
            </Grid>
            </Paper>
        </Container>
    );
}