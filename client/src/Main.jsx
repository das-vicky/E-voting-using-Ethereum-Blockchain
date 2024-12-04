import { useState, useEffect } from "react";
import { useEth } from "./contexts/EthContext";
import "./styles.css";

function MainComp() {
  const { state: { contract, accounts } } = useEth();

  const [candidateData, setCandidateData] = useState({
    name: "",
    party: "",
  });
  const [votingDates, setVotingDates] = useState({ start: "", end: "" });
  const [candidates, setCandidates] = useState([]);
  const [voteStatus, setVoteStatus] = useState(false);
  const [candidateId, setCandidateId] = useState("");

  const fetchCandidates = async () => {
    try {
      const count = await contract.methods.getCountCandidates().call();
      const candidateList = [];
      for (let i = 1; i <= count; i++) {
        const candidate = await contract.methods.getCandidate(i).call();
        candidateList.push({
          id: candidate[0],
          name: candidate[1],
          party: candidate[2],
          voteCount: candidate[3],
        });
      }
      setCandidates(candidateList);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  const fetchVotingDates = async () => {
    try {
      const dates = await contract.methods.getDates().call();
      setVotingDates({
        start: new Date(dates[0] * 1000).toLocaleString(),
        end: new Date(dates[1] * 1000).toLocaleString(),
      });
    } catch (error) {
      console.error("Error fetching voting dates:", error);
    }
  };

  const checkVoteStatus = async () => {
    try {
      const hasVoted = await contract.methods.checkVote().call({ from: accounts[0] });
      setVoteStatus(hasVoted);
    } catch (error) {
      console.error("Error checking vote status:", error);
    }
  };

  const handleAddCandidate = async () => {
    const { name, party } = candidateData;
    try {
      await contract.methods.addCandidate(name, party).send({ from: accounts[0] });
      alert("Candidate added successfully!");
      fetchCandidates();
    } catch (error) {
      console.error("Error adding candidate:", error);
    }
  };

  const handleSetDates = async () => {
    const startTimestamp = Math.floor(new Date(votingDates.start).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(votingDates.end).getTime() / 1000);
    try {
      await contract.methods.setDates(startTimestamp, endTimestamp).send({ from: accounts[0] });
      alert("Voting dates set successfully!");
      fetchVotingDates();
    } catch (error) {
      console.error("Error setting voting dates:", error);
    }
  };

  const handleVote = async () => {
    try {
      await contract.methods.vote(candidateId).send({ from: accounts[0] });
      alert("Vote submitted successfully!");
      fetchCandidates();
      checkVoteStatus();
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchVotingDates();
    checkVoteStatus();
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>E-Voting DApp</h1>
      </header>

      <main className="main-container">
        <section className="section">
          <h2>Add Candidate</h2>
          <div className="form">
            <input
              type="text"
              placeholder="Candidate Name"
              value={candidateData.name}
              onChange={(e) => setCandidateData({ ...candidateData, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Party Name"
              value={candidateData.party}
              onChange={(e) => setCandidateData({ ...candidateData, party: e.target.value })}
            />
            <button className="button-primary" onClick={handleAddCandidate}>
              Add Candidate
            </button>
          </div>
        </section>

        <section className="section">
          <h2>Set Voting Dates</h2>
          <div className="form">
            <input
              type="datetime-local"
              onChange={(e) => setVotingDates({ ...votingDates, start: e.target.value })}
            />
            <input
              type="datetime-local"
              onChange={(e) => setVotingDates({ ...votingDates, end: e.target.value })}
            />
            <button className="button-primary" onClick={handleSetDates}>
              Set Dates
            </button>
          </div>
          <div className="info-box">
            <h3>Current Voting Dates</h3>
            <p>Start: {votingDates.start || "Not Set"}</p>
            <p>End: {votingDates.end || "Not Set"}</p>
          </div>
        </section>

        <section className="section">
          <h2>Candidates</h2>
          <ul className="candidate-list">
            {candidates.map((candidate) => (
              <li key={candidate.id} className="candidate-item">
                <strong>{candidate.name}</strong> ({candidate.party})
                <span className="vote-count">Votes: {candidate.voteCount}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="section">
          <h2>Vote</h2>
          <div className="form">
            <input
              type="number"
              placeholder="Candidate ID"
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
            />
            <button className="button-primary" onClick={handleVote}>
              Vote
            </button>
          </div>
        </section>

        <section className="section">
          <h2>Vote Status</h2>
          <button className="button-secondary" onClick={checkVoteStatus}>
            Check Status
          </button>
          <div className="info-box">
            {voteStatus ? <p>You have already voted.</p> : <p>You haven't voted yet.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}

export default MainComp;
