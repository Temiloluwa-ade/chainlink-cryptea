import "../../assets/styles/auth.css";
import "../../assets/styles/sett.css";
import { useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { IoMdClose } from 'react-icons/io';
import { useMoralis } from "react-moralis";
import { Web3Storage } from "web3.storage";
import { MdVisibilityOff, MdVisibility } from "react-icons/md";
import {
  Button,
  OutlinedInput,
  Avatar,
  FormControl,
  IconButton,
  InputAdornment,
  Modal,
  InputLabel,
  Box,
  TextField,
  LinearProgress,
  Alert
} from "@mui/material";



const DashSettings = () => {


  const { Moralis, user } = useMoralis();
  const [dp, setDp] = useState(user.get('img')); 
  const [userLink, setUserLink] = useState("");
  const [userDescription, setUserDescription] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userInfo, setuserInfo] = useState("");
  const [currentPass, setCurrentPass] = useState("");
  const [pass, setPass] = useState("");
  const [repass, setRepass] = useState("");
  const [isLoading, setLoading] = useState({
    account: false, security: false, link: false, progress: [0, 0]
  });
  const [crop, setCrop] = useState();
  const [simg, setsImg] = useState(null);
  const [iimg, setIiimg] = useState({});
  const [result, setResult] = useState(null);

  const [openM, setOpenM] = useState(false);

  const handleOpenM = () => setOpenM(true);
  const handleCloseM = () => setOpenM(false);


  const [error, setError] = useState({
    account: "", security: "", link: ""
  });

  const [success, setSuccess] = useState({
    account: "", security: "", link: ""
  });

  const [currentViewpass, setCurrentViewpass] = useState(false);
  const [viewpass, setViewpass] = useState(false);
  const [viewRepass, setViewRepass] = useState(false);



  const passvalid = () => {
      	let noNum = false;
        let noChar = false;
        let noSpec = false;

        if (pass.length) {
          if (/[\d]/g.test(pass)) {
            noNum = true;
          }
          if (/[\W]/g.test(pass)) {
            noSpec = true;
          }
          if (pass.length >= 8) {
            noChar = true;
          }
          if ((noChar && noNum) || (noChar && noSpec)) {
            return false;
          } else {
            return true;
          }
        } else {
          return true;
        }
  }


  const submitAccount = async () => {
      document.querySelector('#account_sett').scrollIntoView();
      window.scrollTo(0, 0);
      setError({
        ...error,
        account: ""
      });
      setSuccess({
       ...success, account: ""
      });
      let more = true;
      setLoading({...isLoading, account: true});

      [userInfo, userEmail].forEach(d => {
          if(!d.length) {  
              setError(
                  {...error, account: "Data Incomplete, Please required fields should be field" }
                );
                
                setLoading({...isLoading, account: false });
                more = false;
          }
      });

      if (more) {
          if (userEmail.match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) === null) {
              setError(
                {...error, account: "Email Address Is Incorrect"}
              );
              setLoading({ ...isLoading, account: false });
              
          }

        if(!error['account'].length){
            
        try{
          user.set("username", userInfo);
          user.set("email", userEmail);
          await user.save();
        
            setSuccess({...success, account: "Account Details Saved Successfully"})
            setLoading({ ...isLoading, account: false });
        } catch(err){
            setError({ ...error, account: err.message });
              setLoading({...isLoading, account: false });
        }

      }
    }
  }

   const imgCrop = (event) => {
      handleOpenM();
     const fil = event.target.files[0];
     const {type, size} = fil;
     const ee = ['image/jpeg', 'image/jpg', 'image/png'];

     if(!ee.includes(type)){
          setError({
            ...error,
            account: "Only JPEG, jpg, and png image types are accepted"
          });
          return;  
     }

     if (size > 5243880) {
      setError({ ...error, account: "Image Size Exceeds The Limit Of 5mb" });
       return;
     }

     setsImg(URL.createObjectURL(fil));
     setIiimg(fil);

   };

   const makeStorageClient = async () => {
      return new Web3Storage({
        token: await Moralis.Cloud.run("getWeb3StorageKey"),
      });
    }

     const beginUpload = async (files, type) => {
       const { size: totalSize } = files[0];
  

       const onRootCidReady = (cid) => {
         setError({ ...error, account: "" });
         setSuccess({ ...success, account: "Image Uploaded Successfully, might take a while to fully reflect"});         
          const img = `https://${cid}.ipfs.dweb.link/${user.get("username")}.${type}`;
          console.log(img)       
        setDp(img);
         user.set("img", img);

         user.save()
         
        handleCloseM();
       };

       let uploaded = 0;

       const onStoredChunk = (size) => {
         uploaded += size;

         const pct = (totalSize / uploaded) * 100;

         console.log(`Uploading... ${pct.toFixed(2)}% complete`);

         setLoading({...isLoading, progress: [pct, uploaded]})

       };

       const client = await makeStorageClient();

       return client.put(files, { onRootCidReady, onStoredChunk });
     }; 


     const cropImg = () => {
       const img = document.querySelector(".img");
       try {
         const canvas = document.createElement("canvas");
         const scaleX = img.naturalWidth / img.width;
         const scaleY = img.naturalHeight / img.height;
         canvas.width = crop.width;
         canvas.height = crop.height;
         const ctx = canvas.getContext("2d");
         ctx.drawImage(
           img,
           crop.x * scaleX,
           crop.y * scaleY,
           crop.width * scaleX,
           crop.height * scaleY,
           0,
           0,
           crop.width,
           crop.height
         );
         const { type } = iimg;
         const ext = type.split("/");
         canvas.toBlob(
           (blob) => {
             const files = [new File([blob], `${user.get('username')}.${ext[1]}`)];
             beginUpload(files, ext[1]);
           },
           type,
           1
         );
   

       } catch (e) {
         setError({ ...error, account: e.message });
       }
     };


  const submitLink = async () => {
    document.querySelector("#link_sett").scrollIntoView();
    window.scrollTo(0, 0);
    setError({
      ...error,
      link: ""
    });
    setSuccess({
      ...success,
      link: ""
    });
    let more = true;
    setLoading({ ...isLoading, link: true });
    [userDescription, userLink].forEach((d) => {
      if (!d.length) {
        setError({
          ...error,
          link: "Data Incomplete, Please required fields should be field"
        });
        setLoading({ ...isLoading, link: false });
        more = false;
      }
    });

    if (more) {
      if (
        userDescription.length < 50
      ) {
        setError({ ...error, link: "Atleast 50 characters are required in your description" });
        setLoading({  ...isLoading, link: false });
      }

      if (!error["link"].length) {
        const Links = Moralis.Object.extend("link");
        const link = new Links();
          link.set("link", userLink);
          user.set('desc', userDescription);
     
        try {
          await link.save();
          await user.save();
          setSuccess({
            ...success,
            link: "Link Details Saved Successfully"
          });
          setLoading({ ...isLoading, link: false });
        } catch (err) {
          setError({ ...error, link: err.message });
          setLoading({ ...isLoading, link: false });
        }
      }
    }
  };

  const {username, email, desc } = user.attributes; 


  const submitSecure = async () => {
    document.querySelector("#security_sett").scrollIntoView();
    window.scrollTo(0, 0);
    setError({
      ...error,
      security: "",
    });
    setSuccess({
      ...success,
      security: "",
    });
    let more = true;
    setLoading({ ...isLoading, security: true });
    [currentPass, pass, repass].forEach((d) => {
      if (!d.length) {
        setError({
          ...error,
          security: "Data Incomplete, Please required fields should be field",
        });
        setLoading({ ...isLoading, security: false });
        more = false;
      }
    });

    if (more) {
      if (passvalid(pass)) {
        setError({
          ...error,
          security:
            "Password with minimum of 8 characters including either a number or special characters",
        });
        setLoading({ ...isLoading, security: false });
      }else if (repass !== pass){
          setError({
            ...error,
            security: "Repeat password should be equal to new password",
          });
        setLoading({ ...isLoading, security: false });
      }

      if (!error["security"].length) {

        user.setPassword(pass);

        try {
          await user.save();
          setSuccess({
            ...success,
            security: "Security Details Saved Successfully",
          });
          setLoading({ ...isLoading, security: false });
        } catch (err) {
          setError({ ...error, security: err.message });
          setLoading({ ...isLoading, security: false });
        }
      }
    }
  };


  return (
    <div className="2sm:pr-1 sett dashbody cusscroller overflow-y-scroll overflow-x-hidden px-5 pb-5 h-[calc(100%-75px)]">
      <Modal
        open={openM}
        onClose={handleCloseM}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            minWidth: 340,
            maxHeight: "100vh",
            border: "none",
            width: "80%",
            backgroundColor: "#fff",
            maxWidth: 800,
            p: 2,
          }}
          className="text-center"
        >
          {Boolean(isLoading["progress"][0]) && (
            <Box className="text-[#F57059] mb-1" sx={{ width: "100%" }}>
              <LinearProgress
                variant="buffer"
                value={isLoading["progress"][0]}
                valueBuffer={isLoading["progress"][1]}
              />
            </Box>
          )}

          {error["account"].length > 0 && (
            <Alert className="w-full" severity="error">
              {error["account"]}
            </Alert>
          )}

          {success["account"].length > 0 && (
            <Alert className="w-full" severity="success">
              {success["account"]}
            </Alert>
          )}

          <ReactCrop
            minWidth={100}
            minHeight={100}
            circularCrop={true}
            crop={crop}
            aspect={1}
            onChange={(c) => {
              setCrop(c);
            }}
          >
            <img
              className="img w-full m-auto !max-h-[calc(100vh-128px)] min-w-[340px]"
              alt="crop me"
              src={simg}
            />
          </ReactCrop>

          <div className="py-2 mt-4 flex justify-center">
            <Button
              variant="contained"
              className="!bg-[#F57059] !mr-2 !py-[13px] !font-medium !capitalize"
              style={{
                fontFamily: "inherit",
              }}
              fullWidth
              onClick={cropImg}
            >
              Update Image
            </Button>

            <Button
              onClick={handleCloseM}
              variant="contained"
              className="!bg-[#F57059] max-w-[100px] !ml-2 !py-[13px] !font-medium !capitalize"
              style={{
                fontFamily: "inherit",
              }}
              fullWidth
            >
              Close
              <IoMdClose className="ml-3 font-medium" size={18} />
            </Button>
          </div>
        </Box>
      </Modal>
      <div className="w-[80%] usm:w-[90%] sm:w-full">
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitAccount();
            }}
            method="POST"
            action="#"
            id="account_sett"
            entype="multipart/form-data"
          >
            <div className="w-full justify-center mt-4">
              <div className="flex flex-col mx-7 items-center justify-center">
                <div className="flex flex-row border-b mmd:flex-col justify-start w-full">
                  <div className="flex items-center justify-between font-semibold w-full">
                    <span className="text-[25px] font-[800] mb-2">Account</span>
                  </div>
                </div>
                {isLoading["account"] === true && (
                  <Box className="text-[#F57059]" sx={{ width: "100%" }}>
                    <LinearProgress color="inherit" />
                  </Box>
                )}

                {error["account"].length > 0 && (
                  <Alert className="w-full" severity="error">
                    {error["account"]}
                  </Alert>
                )}

                {success["account"].length > 0 && (
                  <Alert className="w-full" severity="success">
                    {success["account"]}
                  </Alert>
                )}
                <div className="username w-full">
                  <div className="flex mmd:flex-col-reverse mmd:items-center justify-between items-start">
                    <div className="w-full">
                      <div className="font-semibold mt-5 mb-4 text-[#777]">
                        Change Username
                      </div>
                      <div className="mt-2">
                        <div name="inputName" className="rounded-md">
                          <div className="flex">
                            <TextField
                              className="bg-[white]"
                              label={"Username"}
                              value={userInfo}
                              fullWidth
                              placeholder={username}
                              name="username"
                              onChange={(e) => {
                                setError({
                                  ...error,
                                  account: "",
                                });
                                setSuccess({
                                  ...success,
                                  account: "",
                                });
                                setuserInfo(e.target.value);
                              }}
                            />
                          </div>
                        </div>

                        <div className="font-semibold mt-5 mb-4 text-[#777]">
                          Change Email
                        </div>
                        <div name="inputEmail" className="rounded-md mt-2">
                          <div className="flex">
                            <TextField
                              className="bg-[white]"
                              label={"Email"}
                              placeholder={email}
                              value={userEmail}
                              onChange={(e) => {
                                setUserEmail(e.target.value);
                                setError({
                                  ...error,
                                  account: "",
                                });
                                setSuccess({
                                  ...success,
                                  account: "",
                                });
                              }}
                              name="email"
                              fullWidth
                            />
                          </div>
                        </div>

                        <div className="flex flex-row justify-end w-full mt-8">
                          <Button
                            variant="contained"
                            type="submit"
                            className="!text-sm !rounded-lg !bg-[#F57059] !text-white !font-semibold !py-4 !px-10"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="min-w-[300px] mmd:mb-3 flex items-center flex-col relative">
                      <div className="font-semibold mt-5 mb-4 text-[#777]">
                        Profile Picture
                      </div>
                      {!Boolean(dp) ? (
                        <Avatar
                          sx={{
                            bgcolor: "#F57059",
                            width: 190,
                            height: 190,
                          }}
                          className="!font-bold imm !text-[35px]"
                          alt={user.get("username")}
                        >
                          {user.get("username").charAt(0).toUpperCase()}
                        </Avatar>
                      ) : (
                        <Avatar
                          src={dp}
                          sx={{ width: 190, height: 190 }}
                          alt={user.get("username")}
                        ></Avatar>
                      )}
                      <div className="mt-1">
                        <input
                          type="file"
                          accept="image/*"
                          className="!hidden dpp"
                          style={{
                            display: "none !important",
                            visibility: "hidden !important",
                          }}
                          onChange={imgCrop}
                        />

                        <Button
                          onClick={() => {
                            document.querySelector(".dpp").click();
                          }}
                          variant="contained"
                          className="!text-sm !rounded-lg !capitalize !bg-[#F57059] !text-white !font-semibold p-[10px]"
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitLink();
            }}
            method="POST"
            action="#"
            id="link_sett"
            entype="multipart/form-data"
          >
            <div className="w-full justify-center mt-4">
              <div className="flex flex-col mx-7 items-center justify-center">
                <div className="flex flex-row border-b justify-start w-full">
                  <div className="flex items-center justify-between font-semibold w-full">
                    <span className="text-[25px] font-[800] mb-2">
                      Your Link
                    </span>
                  </div>
                </div>
                {isLoading["link"] && (
                  <Box className="text-[#F57059]" sx={{ width: "100%" }}>
                    <LinearProgress color="inherit" />
                  </Box>
                )}

                {error["link"].length > 0 && (
                  <Alert className="w-full" severity="error">
                    {error["link"]}
                  </Alert>
                )}

                {success["link"].length > 0 && (
                  <Alert className="w-full" severity="success">
                    {success["link"]}
                  </Alert>
                )}

                <div className="username w-full">
                  <div className="mt-2">
                    <div className="font-semibold mt-5 mb-4 text-[#777]">
                      Change Cryptea Link
                    </div>
                    <div className="flex mt-2">
                      <FormControl
                        sx={{
                          width: "100%",
                        }}
                        variant="outlined"
                      >
                        <InputLabel htmlFor="current-password">Link</InputLabel>
                        <OutlinedInput
                          className="bg-[white] !p-0"
                          placeholder={desc}
                          name="Link"
                          label="Link"
                          onChange={(e) => {
                            const lk = e.target.value;
                            setUserLink(
                              lk.replace(/[/\\.@#&?;,:"'~*^%|]/g, "")
                            );

                            setError({
                              ...error,
                              link: "",
                            });
                            setSuccess({
                              ...success,
                              link: "",
                            });
                          }}
                          startAdornment={
                            <InputAdornment position="start">
                              <div className="text-[#838383] rounded-l-md p-[15px] pr-0">
                                cryptea.com/
                              </div>
                            </InputAdornment>
                          }
                        />
                      </FormControl>
                    </div>

                    <div className="font-semibold mt-5 mb-4 text-[#777]">
                      Change Description
                    </div>
                    <div name="inputDescription" className="rounded-md mt-2">
                      <div className="flex">
                        <TextField
                          type="textarea"
                          className="bg-[white]"
                          label={"Description"}
                          placeholder="I created Ethereum"
                          value={userDescription}
                          onChange={(e) => {
                            setUserDescription(e.target.value);

                            setError({
                              ...error,
                              link: "",
                            });
                            setSuccess({
                              ...success,
                              link: "",
                            });
                          }}
                          name="desc"
                          fullWidth
                          multiline
                          minRows={3}
                        />
                      </div>
                    </div>

                    <div className="flex flex-row justify-end w-full mt-8">
                      <Button
                        variant="contained"
                        type="submit"
                        className="!text-sm !rounded-lg !bg-[#F57059] !text-white !font-semibold !py-4 !px-10"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitSecure();
            }}
            method="POST"
            id="security_sett"
            action="#"
            entype="multipart/form-data"
          >
            <div className="w-full justify-center mt-4">
              <div className="flex flex-col mx-7 justify-center">
                <div className="flex flex-row border-b justify-start w-full">
                  <div className="flex items-center justify-between font-semibold w-full">
                    <span className="text-[25px] font-[800] mb-2">
                      Security
                    </span>
                  </div>
                </div>
                {isLoading["security"] && (
                  <Box className="text-[#F57059]" sx={{ width: "100%" }}>
                    <LinearProgress color="inherit" />
                  </Box>
                )}

                {error["security"].length > 0 && (
                  <Alert className="w-full" severity="error">
                    {error["security"]}
                  </Alert>
                )}

                {success["security"].length > 0 && (
                  <Alert className="w-full" severity="success">
                    {success["security"]}
                  </Alert>
                )}

                <div className="font-semibold mt-5 mb-4 text-[#777]">
                  Change Password
                </div>
                <div className="rounded-md">
                  <div className="flex">
                    <FormControl
                      sx={{
                        width: "100%",
                      }}
                      variant="outlined"
                    >
                      <InputLabel htmlFor="current-password">
                        Current Password
                      </InputLabel>
                      <OutlinedInput
                        className="bg-[white]"
                        id="current-password"
                        type={currentViewpass ? "text" : "password"}
                        value={currentPass}
                        onChange={(e) => {
                          setCurrentPass(e.target.value);
                          setError({
                            ...error,
                            security: "",
                          });
                          setSuccess({
                            ...success,
                            security: "",
                          });
                        }}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() =>
                                setCurrentViewpass(!currentViewpass)
                              }
                              onMouseDown={(event) => {
                                event.preventDefault();
                              }}
                              edge="end"
                            >
                              {currentViewpass ? (
                                <MdVisibilityOff />
                              ) : (
                                <MdVisibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Current Password"
                        placeholder="******"
                      />
                    </FormControl>
                  </div>
                </div>

                <div className="rounded-md mt-4">
                  <div className="flex">
                    <FormControl
                      sx={{
                        width: "100%",
                      }}
                      variant="outlined"
                    >
                      <InputLabel htmlFor="new-password">
                        New Password
                      </InputLabel>
                      <OutlinedInput
                        className="bg-[white]"
                        id="new-password"
                        type={viewpass ? "text" : "password"}
                        value={pass}
                        onChange={(e) => {
                          setPass(e.target.value);
                          setError({
                            ...error,
                            security: "",
                          });
                          setSuccess({
                            ...success,
                            security: "",
                          });
                        }}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setViewpass(!viewpass)}
                              onMouseDown={(event) => {
                                event.preventDefault();
                              }}
                              edge="end"
                            >
                              {viewpass ? (
                                <MdVisibilityOff />
                              ) : (
                                <MdVisibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="New Password"
                        placeholder="******"
                      />
                    </FormControl>
                  </div>
                </div>

                <div className="rounded-md mt-4">
                  <div className="flex">
                    <FormControl
                      sx={{
                        width: "100%",
                      }}
                      variant="outlined"
                    >
                      <InputLabel htmlFor="Reenter-new-password">
                        Re-enter New Password
                      </InputLabel>
                      <OutlinedInput
                        className="bg-[white]"
                        id="Reenter-new-password"
                        type={viewRepass ? "text" : "password"}
                        value={repass}
                        onChange={(e) => {
                          setRepass(e.target.value);
                          setError({
                            ...error,
                            security: "",
                          });
                          setSuccess({
                            ...success,
                            security: "",
                          });
                        }}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle re-enter password visibility"
                              onClick={() => setViewRepass(!viewRepass)}
                              onMouseDown={(event) => {
                                event.preventDefault();
                              }}
                              edge="end"
                            >
                              {viewRepass ? (
                                <MdVisibilityOff />
                              ) : (
                                <MdVisibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Re-enter New Password"
                        placeholder="******"
                      />
                    </FormControl>
                  </div>
                </div>
                <div className="flex flex-row justify-end w-full mt-8">
                  <Button
                    variant="contained"
                    type="submit"
                    className="!text-sm !rounded-lg !bg-[#F57059] !text-white !font-semibold !py-4 !px-10"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DashSettings;
