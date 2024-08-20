// ham bar bar db se baat karenge to isliye alag se ek utilities bnate hai or iske bar bar execute karte rehenge

const asynchandler = (requesthandler) => {
  return (req, res, next) => {
    Promise.resolve(requesthandler(req, res, next)).catch((err) => {
      next(err);
    });
  };
};
export { asynchandler };

// const asynchandler = () => {};
// const asynchandler = (func)= () => {};
// const asynchandler = (func)= async() => {};

// const asynchandle = (fn = async (req, res,next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//         success:false,
//         message:err.message
//         })

//     }
// });

// export {asynchandle}
