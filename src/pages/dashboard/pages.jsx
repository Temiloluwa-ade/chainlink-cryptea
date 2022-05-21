import empty from '../../assets/img/coming-soon.svg';
const DashPages = () => {
    return (
      <div>
        <div
          className="empty"
          style={{
            display: "flex",
            width: "100%",
            height: "fit-content",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <img
            src={empty}
            className="mb-3"
            style={{
              minWidth: 300,
              width: "80%"
            }}
            alt="Would Be Released soon"
          />

          <h2 className="mt-2 font-bold">
            This Feature would be released soon, we are working on it
          </h2>
        </div>
      </div>
    );
}
 
export default DashPages;