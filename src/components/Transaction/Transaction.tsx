import { useEffect, useState } from "react";
import "./Transaction.scss";
import { BiTransfer } from "react-icons/bi";
import { getTransactions } from "../../services/ApiServices";
import { SiConvertio } from "react-icons/si";
import { BiSolidPurchaseTag } from "react-icons/bi";
import moment from "moment";
import eventEmitter from "../../utils/events";
import { MdRedeem } from "react-icons/md";
import { RiExternalLinkLine } from "react-icons/ri";
import { ClipLoader } from "react-spinners";

const Transaction = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const result = await getTransactions(page, pageSize);
      if (!result.status) {
        throw new Error(result.message);
      }
      setTransactions(result?.data?.data);
    } catch (error: any) {
      console.log(error?.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTransactions();
  }, []);

  eventEmitter.removeAllListeners("transactionReload");
  eventEmitter.on("transactionReload", fetchTransactions);

  return (
    <div className="transaction">
      <div className="table-responsive h-100">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Transaction</th>
              <th scope="col">Date</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody>
            {!loading && transactions?.length > 0 &&
              transactions.map((txn: any, key: number) => (
                <tr key={key}>
                  <td
                    className="d-flex justify-content-start align-items-center"
                    style={{ width: "40%", textAlign: "start" }}
                  >
                    {" "}
                    <div className="icon-div">
                      {txn.label?.includes("Buy") && <BiSolidPurchaseTag />}
                      {txn.label?.includes("Conversion") && <SiConvertio />}
                      {txn.label?.includes("Transfer Token") && <BiTransfer />}
                      {txn.label?.includes("Redeem") && <MdRedeem />}
                    </div>
                    {txn.label?.length > 14
                      ? txn.label.slice(0, 15)
                      : txn.label}
                    {txn.label?.includes("Transfer Token") && (
                      <a
                        href={`https://www.oklink.com/amoy/tx/${txn.transactionHash}`}
                        target="_blank"
                      > 
                        <RiExternalLinkLine
                          color="#01f801"
                          style={{ marginLeft: "4px", cursor: "pointer" }}
                        />
                      </a>
                    )}
                  </td>
                  <td style={{ width: "40%", textAlign: "center" }}>
                    {" "}
                    {moment(txn.createdOn).local().format("DD MMMM, YYYY")}
                  </td>
                  <td
                    className={`${
                      txn.paymentRef === "Credit" ? "green" : "red"
                    }`}
                    style={{ width: "20%", textAlign: "end" }}
                  >
                    {txn.paymentRef === "Credit" ? "+" : "-"}
                    {txn.tokenValue ? <>{txn.tokenValue} <span>T</span></> : (
                      <>
                        {txn.amount}{" "}
                        {txn.sessionId ? <span>$</span> : <span>P</span>}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            {!loading && transactions && transactions?.length === 0 && (
              <tr>
                <td></td>
                <td>No transactions yet</td>
                <td></td>
              </tr>
            )}
          </tbody>
          {loading && (
            <div className="">
              <ClipLoader color="#01f801"/>
            </div>
          )}
        </table>
      </div>
    </div>
  );
};

export default Transaction;
