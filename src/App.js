import React, { useEffect, useState } from "react";
import { Statistic, Timeline } from "antd";
import { Container, Spinner, AbsoluteCenter } from "@chakra-ui/react";
import * as dayjs from "dayjs";
import "./index.css";
import Pusher from "pusher-js";
import capri from './capri-island.png'

const { Countdown: CDC } = Statistic;

const App = () => {
    const dueDate = dayjs("2023-08-28").hour(1).format();
    const baseUrl = process.env.REACT_APP_BASE_URL;
    
    const [updates, setUpdates] = useState({});
    const [countdown, setCountDown] = useState(true);
    const [reload, setReload] = useState(false);

    React.useEffect(() => {
        const pusher = new Pusher(process.env.REACT_APP_PUSHER_ID, {
            cluster: "us3",
        });

        var channel = pusher.subscribe("my-channel");

        channel.bind("my-event", function ({ message }) {
            if (message === "New update added!") {
                setReload(reload === true ? false : true);
            }
        });

        return (() => {
			pusher.unsubscribe('my-channel')
		})
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        const loadData = async () => {
            const loadUpdates = async () => {
                let results = await fetch(`${baseUrl}/updates/latest`).then(
                    (resp) => resp.json()
                );
                setUpdates(results);
            };

            const loadCountdown = async () => {
                let { coutdown } = await fetch(`${baseUrl}/countdown/`).then(
                    (resp) => resp.json()
                );
                setCountDown(coutdown);
            };

            loadUpdates();
            loadCountdown();
        };

        const intervalId = setInterval(() => {
            loadData();
        }, 2000);

        return () => {
            clearInterval(intervalId);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updates]);

    const formatDate = (dbDate) => {
        const date = dayjs(dbDate).format("MMM-DD-YY");
        const time = dayjs(dbDate).format("h:mm A");

        if (dbDate.endsWith("00:00.000Z")) {
            return { date };
        }

        return { date, time };
    };

    return (
        <Container h="100vh" w="100vw" pt="10">
            <img src={capri} alt="Capri, Italy" style={{ marginBottom: '20px', borderRadius: '5px' }} />
            {updates?.length > 0 ? <><h1 style={{ fontSize: '30px' }}> <b>Capri Updates</b></h1> <p style={{ marginBottom: '40px' }}>Welcome! No need to refresh. Updates will appear automatically.</p></> : null}
            {updates?.length > 0 ? (
                <Timeline
                    pending={
                        countdown && (
                            <CDC
                                valueStyle={{
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                }}
                                value={dueDate}
                                format="DD:HH:mm:ss"
                            />
                        )
                    }
                    reverse={true}
                    mode="left"
                >
                    {updates.length &&
                        updates?.map((update, key) => {
                            const formattedDate = formatDate(update.date);
                            return (
                                <Timeline.Item
                                    label={
                                        formattedDate.time ? (
                                            <>
                                                {formattedDate.date} <br />
                                                {formattedDate.time}
                                            </>
                                        ) : (
                                            formattedDate.date
                                        )
                                    }
                                    style={
                                        key === 0
                                            ? { paddingBottom: "0px" }
                                            : { paddingBottom: "40px" }
                                    }
                                    color={
                                        update.color === "default"
                                            ? "gray"
                                            : update.color
                                    }
                                    key={key}
                                >
                                    {update.update}
                                    {update.image ? <span dangerouslySetInnerHTML={{ __html: update.image }}/> : null}
                                </Timeline.Item>
                            );
                        })}
                </Timeline>
            ) : (
                <AbsoluteCenter>
                    <Spinner />
                </AbsoluteCenter>
            )}
        </Container>
    );
};

export default App;
