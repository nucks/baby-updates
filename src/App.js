import React, { useEffect, useState } from "react";
import { Statistic, Timeline } from "antd";
import { Container, Spinner, AbsoluteCenter } from "@chakra-ui/react";
import * as dayjs from "dayjs";
import "./index.css";
import Pusher from "pusher-js";

const { Countdown: CDC } = Statistic;

const App = () => {
    const dueDate = dayjs("2023-04-24").hour(1).format();
    const baseUrl = "https://jodb.onrender.com";
    const [updates, setUpdates] = useState({});
    const [countdown, setCountDown] = useState(true);
    const [reload, setReload] = useState(false);

    const pusher = new Pusher("29ce6a7e07fa49dc518d", {
        cluster: "us3",
    });

    var channel = pusher.subscribe("my-channel");
    channel.bind("my-event", function ({ message }) {
        if (message === "New update added!") {
            setReload(reload === true ? false : true);
        }
    });

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
            if (Object.keys(updates).length === 0) {
                loadData();
            }
        }, 2000);

        return () => {
            clearInterval(intervalId);
        };
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
        <Container h="100vh" w="100vw">
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
