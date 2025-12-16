// import {
//   Box,
//   Container,
//   Typography,
//   TextField,
//   Button,
//   Link,
//   Divider,
//   IconButton,
//   InputAdornment,
//   Stack
// } from "@mui/material";
// import {
//   Twitter as TwitterIcon,
//   Facebook as FacebookIcon,
//   Instagram as InstagramIcon,
//   LinkedIn as LinkedInIcon,
//   Send as SendIcon
// } from "@mui/icons-material";
// import SchoolIcon from "@mui/icons-material/School";
// import { red } from "@mui/material/colors";

// export default function Footer() {
//   const currentYear = new Date().getFullYear();

//   return (
//     <Box component="footer" sx={{ bgcolor: 'grey.900', color: 'white', pt: 8, pb: 4, letterSpacing: 2 }}>
//       <Container maxWidth="lg">
//         {/* Main Footer Content */}
//         <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 8 }}>
//           {/* Company Info */}
//           <Box sx={{ flex: { xs: '2 2 100%', md: '2 2 45%', lg: '2 2 30%' } }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//               <SchoolIcon sx={{ fontSize: 32, color: 'white', mr: 1 }} />
//               <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
//                 Innovative Education, Miraj
//               </Typography>
//             </Box>
//               <Typography variant="body2" sx={{ color: 'grey.400', mb: 3, letterSpacing:1, lineHeight:1.5 }}>
//               Expert Designed Question Bank Prepared by <span className="text-amber-400 font-bold">experienced faculty</span>.
//               Free Mock Tests & Practice Attempt unlimited mock tests anytime
//               Instant Results & Analysis to check your performance instantly.  Helping students to achieve their dreams of getting into top colleges through quality test preparation and guidance.
//             </Typography>
//             <Typography variant="body2" sx={{ color: 'grey.400', mb: 3, letterSpacing: 1,lineHeight:2 }}>
             
//             </Typography>
            
//             {/* <Stack direction="row" spacing={2}>
//               <IconButton size="small" sx={{ color: 'grey.500', '&:hover': { color: 'white' } }}>
//                 <TwitterIcon fontSize="small" />
//               </IconButton>
//               <IconButton size="small" sx={{ color: 'grey.500', '&:hover': { color: 'white' } }}>
//                 <FacebookIcon fontSize="small" />
//               </IconButton>
//               <IconButton size="small" sx={{ color: 'grey.500', '&:hover': { color: 'white' } }}>
//                 <LinkedInIcon fontSize="small" />
//               </IconButton>
//               <IconButton size="small" sx={{ color: 'grey.500', '&:hover': { color: 'white' } }}>
//                 <InstagramIcon fontSize="small" />
//               </IconButton>
//             </Stack> */}
//             <Box>
//               <Typography color="white" fontWeight={400} style={{ marginTop: "20px" }}>
//                 <b><span>&nbsp;&nbsp;&nbsp;</span>  Powered By</b>
//                 <br />
//                 <Link href={"https://myonlinehubs.com"}  >
//                   <img src="./images/logos/logo-innovative-dark.png" style={{ maxWidth: "200px", marginTop: "10px" }} />
//                 </Link>
//               </Typography>
//             </Box>
//           </Box>

//           {/* Quick Links */}
//           <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%', lg: '1 1 30%' } }}>
//             <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
//               Quick Links
//             </Typography>
//             <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
//               {[
//                 { text: 'Home', href: '#' },
//                 { text: 'Features', href: '#features' },
//                 { text: 'Exams', href: '#exams' },
//                 { text: 'Pricing', href: '#pricing' },
//                 { text: 'Testimonials', href: '#testimonials' },
//                 { text: 'Contact Us', href: '#contact' }
//               ].map((link) => (
//                 <Box component="li" key={link.text} sx={{ mb: 1.5 }}>
//                   <Link
//                     href={link.href}
//                     underline="hover"
//                     sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}
//                   >
//                     {link.text}
//                   </Link>
//                 </Box>
//               ))}
//             </Box>
//           </Box>

//           {/* Exam Resources */}
//           {/*       <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%', lg: '1 1 30%' } }}>
//              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
//               Exam Resources
//             </Typography>
//             <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
//               {[
//                 { text: 'JEE Main & Advanced', href: '#' },
//                 { text: 'NEET', href: '#' },
//                 { text: 'Karnataka CET', href: '#' },
//                 { text: 'Maharashtra CET', href: '#' },
//                 { text: 'Free Resources', href: '#' },
//                 { text: 'Study Material', href: '#' }
//               ].map((link) => (
//                 <Box component="li" key={link.text} sx={{ mb: 1.5 }}>
//                   <Link 
//                     href={link.href} 
//                     underline="hover" 
//                     sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}
//                   >
//                     {link.text}
//                   </Link>
//                 </Box>
//               ))}
//             </Box> 
//           </Box>*/}

//           {/* Newsletter */}
//           <Box sx={{ flex: { xs: '2 2 100%', md: '2 2 45%', lg: '2 2 30%' } }}>
//             <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color:'orange' }}>
//               Invest in Your <span className="text-4xl text-green-500">Future</span>
//             </Typography>
//             <Typography variant="body2" sx={{ color: 'orange.400', mb: 3,lineHeight:2 }}>
//               Join our Innovative Education Test Series and get access to high-quality questions, instant results, and expert guidance.
//               Prepare smart for JEE, NEET & CET and secure your success!
// <br/>
//               <span className="text-gray-400">– Team Innovative Education

//               Guiding Students to Excellence </span>
//             </Typography>
//             {/* <Typography variant="body2" sx={{ color: 'grey.400', mb: 3, letterSpacing:1 }}>
//               Expert Designed Question Bank Prepared by <span className="text-amber-400 font-bold">experienced faculty</span>.
//               Free Mock Tests & Practice Attempt unlimited mock tests anytime
//               Instant Results & Analysis to check your performance instantly
//             </Typography> */}
//             <Box component="form">
//               <TextField
//                 fullWidth
//                 variant="outlined"
//                 placeholder="Your email address"
//                 size="small"
//                 sx={{
//                   mb: 1,
//                   '& .MuiOutlinedInput-root': {
//                     bgcolor: 'grey.800',
//                     color: 'white',
//                     '& fieldset': {
//                       borderColor: 'grey.700',
//                     },
//                     '&:hover fieldset': {
//                       borderColor: 'grey.600',
//                     },
//                   }
//                 }}
//                 InputProps={{
//                   endAdornment: (
//                     <InputAdornment position="end">
//                       <Button
//                         variant="contained"
//                         color="primary"
//                         sx={{ borderRadius: '0 4px 4px 0', height: '100%', minWidth: 'auto' }}
//                       >
//                         <SendIcon fontSize="small" />
//                       </Button>
//                     </InputAdornment>
//                   ),
//                 }}
//               />
//               <Typography variant="caption" sx={{ color: 'grey.600' }}>
//                 {/* We respect your privacy. Unsubscribe at any time. */}
//               </Typography>
//             </Box>
//           </Box>
//         </Box>

//         {/* Footer Bottom */}
//         <Divider sx={{ borderColor: 'grey.800' }} />

//         <Box
//           sx={{
//             pt: 3,
//             mt: 3,
//             display: 'flex',
//             flexDirection: { xs: 'column', md: 'row' },
//             justifyContent: 'space-between',
//             alignItems: { xs: 'center', md: 'center' }
//           }}
//         >
//           <Typography variant="body2" sx={{ color: 'grey.500', mb: { xs: 2, md: 0 } }}>
//             © {currentYear} Innovative Education. All rights reserved.
//           </Typography>
//           <Stack direction="row" spacing={3}>
//             {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((text) => (
//               <Link
//                 key={text}
//                 href="#"
//                 underline="hover"
//                 sx={{ color: 'grey.500', '&:hover': { color: 'white' }, fontSize: '0.875rem' }}
//               >
//                 {text}
//               </Link>
//             ))}
//           </Stack>
//         </Box>
//       </Container>
//     </Box>
//   );
// }



import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Link,
  Divider,
  IconButton,
  InputAdornment,
  Stack
} from "@mui/material";
import {
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  Send as SendIcon
} from "@mui/icons-material";
import SchoolIcon from "@mui/icons-material/School";
import { red } from "@mui/material/colors";
import { useRouter } from "next/navigation";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const router = useRouter()

  return (
    <Box component="footer" sx={{ bgcolor: 'grey.900', color: 'white', pt: 8, pb: 4, letterSpacing: 2 }}>
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 8 }}>
          {/* Company Info */}
          <Box sx={{ flex: { xs: '2 2 100%', md: '2 2 45%', lg: '2 2 30%' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SchoolIcon sx={{ fontSize: 32, color: 'white', mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Innovative Education, Miraj
              </Typography>
            </Box>
              <Typography variant="body2" sx={{ color: 'grey.400', mb: 3, letterSpacing:1, lineHeight:1.5 }}>
              Expert Designed Question Bank Prepared by <span className="text-amber-400 font-bold">experienced faculty</span>.
              Free Mock Tests & Practice Attempt unlimited mock tests anytime
              Instant Results & Analysis to check your performance instantly.  Helping students to achieve their dreams of getting into top colleges through quality test preparation and guidance.
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.400', mb: 3, letterSpacing: 1,lineHeight:2 }}>
             
            </Typography>
            
            {/* <Stack direction="row" spacing={2}>
              <IconButton size="small" sx={{ color: 'grey.500', '&:hover': { color: 'white' } }}>
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: 'grey.500', '&:hover': { color: 'white' } }}>
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: 'grey.500', '&:hover': { color: 'white' } }}>
                <LinkedInIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: 'grey.500', '&:hover': { color: 'white' } }}>
                <InstagramIcon fontSize="small" />
              </IconButton>
            </Stack> */}
            <Box>
              <Typography color="white" fontWeight={400} style={{ marginTop: "20px" }}>
                <b><span>&nbsp;&nbsp;&nbsp;</span>  Powered By</b>
                <br />
                <Link href={"https://myonlinehubs.com"}  >
                  <img src="./images/logos/logo-innovative-dark.png" style={{ maxWidth: "200px", marginTop: "10px" }} />
                </Link>
              </Typography>
            </Box>
          </Box>

          {/* Quick Links */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%', lg: '1 1 30%' } }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Quick Links
            </Typography>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              {[
                { text: 'Home', href: '#' },
                { text: 'Features', href: '#features' },
                { text: 'Exams', href: '#exams' },
                { text: 'Pricing', href: '#pricing' },
                { text: 'Testimonials', href: '#testimonials' },
                { text: 'Contact Us', href: '#contact' }
              ].map((link) => (
                <Box component="li" key={link.text} sx={{ mb: 1.5 }}>
                  <Link
                    href={link.href}
                    underline="hover"
                    sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}
                  >
                    {link.text}
                  </Link>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Exam Resources */}
          {/*       <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%', lg: '1 1 30%' } }}>
             <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Exam Resources
            </Typography>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              {[
                { text: 'JEE Main & Advanced', href: '#' },
                { text: 'NEET', href: '#' },
                { text: 'Karnataka CET', href: '#' },
                { text: 'Maharashtra CET', href: '#' },
                { text: 'Free Resources', href: '#' },
                { text: 'Study Material', href: '#' }
              ].map((link) => (
                <Box component="li" key={link.text} sx={{ mb: 1.5 }}>
                  <Link 
                    href={link.href} 
                    underline="hover" 
                    sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}
                  >
                    {link.text}
                  </Link>
                </Box>
              ))}
            </Box> 
          </Box>*/}






{/* Sticky Contact Box (Left Side) */}
{/* <div className="fixed top-1/2 right-6 w-[165px] h-[70px] bg-gradient-to-r from-lime-400 to-lime-400 text-white shadow-5xl  rounded-xl p-2 flex flex-col justify-between z-50 border-5 border-white transform -translate-y-1/2"> */}
 

      {/* <div className="fixed bottom-1 right-6 w-[165px] h-[120px] bg-gradient-to-r from-red-600 to-red-700 text-white shadow-3xl rounded-xl p-2 flex flex-col justify-between z-50 border border-blue-300"> */}
        {/* <h3 className="text-xm font-bold mb-1 text-gray-200"> Call us</h3> */}
        {/* <div className="flex items-center gap-1">
       
          <h4 className="text-sm font-medium w-full text-center border-4-white-400">+919421567466</h4>
        </div> */}
        {/* <div className="flex items-center gap-3">
          {/* <FaEnvelope className="text-green-300 text-lg" /> */}
        {/* <p className="text-lg">support@testseriesapp.com</p> */}
        {/* </div>  */}
        {/* <a
          href=""
          className="mt-1 inline-block bg-yellow-400 text-indigo-950 text-xl font-bold text-center py-1 px-2 rounded-md hover:bg-yellow-100 hover:scale-105 transition-transform"
        >
        Start Trial
        </a> */}
         {/* <Button 
               variant="contained" 
               color="success" 
               sx={{ fontWeight: 600, color: 'green' }}
               
                      onClick={() => router.push("/signup")}
               >
                      Free Trial 
                    </Button>
      </div> */}


{/* Sticky Contact Box (Left Side) */}

   {/* <div className="fixed top-1/2 right-6 w-[210px] bg-white/95 shadow-lg rounded-2xl p-2 flex flex-col items-center gap-3 border border-gray-200 backdrop-blur-md transform -translate-y-1/2 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] z-50">
      
      {/* Contact Info */}
      {/* <div className="text-center"> */}
        {/* <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
          Call Us
        </p> */}
        {/* <h4 className="text-base font-bold text-gray-800">
          +91 94215 67466
        </h4>
      </div>

      <div className="w-full border-t border-gray-200"></div> */}

      {/* CTA Button */}
      {/* <Button
        variant="contained"
        fullWidth
        sx={{
          background: "linear-gradient(90deg, #16a34a, #22c55e)",
          color: "#fff",
          fontWeight: 600,
          textTransform: "none",
          borderRadius: "10px",
          py: 1.2,
          boxShadow: "0 4px 10px rgba(22,163,74,0.3)",
          transition: "all 0.3s ease",
          "&:hover": {
            background: "linear-gradient(90deg, #15803d, #16a34a)",
            boxShadow: "0 6px 16px rgba(22,163,74,0.4)",
            transform: "scale(1.05)",
          },
        }}
        onClick={() => router.push("/signup")}
      >
        Start Trial
      </Button>
    </div> */}
{/*    

  <div className="fixed top-1/2 right-6 w-[220px] bg-white shadow-lg rounded-2xl p-4 flex flex-col items-center gap-3 border border-gray-200 backdrop-blur-sm transform -translate-y-1/2 transition-all duration-300 hover:shadow-2xl z-50">
      
      {/* Contact Info */}
      {/* <div className="text-center">
        <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
          Start Your Free Trial
        </p>
       
      </div>

      <div className="w-full border-t border-gray-200"></div> */}

      {/* CTA Button */}
      {/* <Button
        variant="contained"
        fullWidth
        sx={{
          background: "linear-gradient(90deg, #16a34a, #22c55e)", // Corporate green gradient
          color: "#fff",
          fontWeight: 600,
          textTransform: "none",
          borderRadius: "10px",
          py: 1.3,
          boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
          transition: "all 0.3s ease",
          "&:hover": {
            background: "linear-gradient(90deg, #15803d, #16a34a)",
            boxShadow: "0 6px 16px rgba(22,163,74,0.4)",
            transform: "scale(1.05)",
          },
        }}
        onClick={() => router.push("/signup")}
      >
        <h4 className="text-base font-bold text-gray-800">
          Try it Today!
        </h4>
      </Button>
    </div> */}
  


  {/* <div className="fixed top-[55%] right-6 w-[200px] bg-white shadow-2xl rounded-xl p-3 flex flex-col items-center gap-2 border border-gray-200 backdrop-blur-sm transform -translate-y-1/2 transition-all duration-300 hover:shadow-3xl z-50 animate-slideIn"> */}

  {/* Header */}
  {/* <div className="text-center">
    <p className="text-sm font-semibold text-gray-700">
       Start Your Free Trial
    </p>
  </div> */}

  {/* <div className="w-full border-t border-gray-200"></div> */}

  {/* CTA Button with subtle pulse */}
  {/* <Button
    variant="contained"
    fullWidth
    sx={{
      background: "linear-gradient(90deg, #16a34a, #22c55e)",
      color: "#fff",
      fontWeight: 600,
      textTransform: "none",
      borderRadius: "10px",
      py: 1.1, // slightly smaller
      boxShadow: "0 6px 20px rgba(22,163,74,0.4)", // stronger shadow
      transition: "all 0.3s ease",
      animation: "pulse 2.5s infinite",
      "&:hover": {
        background: "linear-gradient(90deg, #15803d, #16a34a)",
        boxShadow: "0 8px 24px rgba(22,163,74,0.5)",
        transform: "scale(1.05)",
      },
    }}
    onClick={() => router.push("/signup")}
  >
   <h3 className="text-base font-bold text-gray-800">
          Try it Today!
        </h3>
  </Button> */}
{/* </div> */}






 






          {/* Newsletter */}
          <Box sx={{ flex: { xs: '2 2 100%', md: '2 2 45%', lg: '2 2 30%' } }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color:'yellow' }}>
              Invest in Your <span className="text-4xl text-lime-600">Future</span>
            </Typography>
            <Typography variant="body2" sx={{ color: 'orange.400', mb: 3,lineHeight:2 }}>
              Join our Innovative Education Test Series and get access to high-quality questions, instant results, and expert guidance.
              Prepare smart for JEE, NEET & CET and secure your success!
<br/>
              <span className="text-gray-400">– Team Innovative Education</span><br></br>

             <span> Guiding Students to Excellence </span>
            </Typography>
            {/* <Typography variant="body2" sx={{ color: 'grey.400', mb: 3, letterSpacing:1 }}>
              Expert Designed Question Bank Prepared by <span className="text-amber-400 font-bold">experienced faculty</span>.
              Free Mock Tests & Practice Attempt unlimited mock tests anytime
              Instant Results & Analysis to check your performance instantly
            </Typography> */}
            <Box component="form">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Your email address"
                size="small"
                sx={{
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'grey.800',
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'grey.700',
                    },
                    '&:hover fieldset': {
                      borderColor: 'grey.600',
                    },
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ borderRadius: '0 4px 4px 0', height: '100%', minWidth: 'auto' }}
                      >
                        <SendIcon fontSize="small" />
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
              <Typography variant="caption" sx={{ color: 'grey.600' }}>
                {/* We respect your privacy. Unsubscribe at any time. */}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Footer Bottom */}
        <Divider sx={{ borderColor: 'grey.800' }} />

        <Box
          sx={{
            pt: 3,
            mt: 3,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: 'center' }
          }}
        >
          <Typography variant="body2" sx={{ color: 'grey.500', mb: { xs: 2, md: 0 } }}>
            © {currentYear} Innovative Education. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={3}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((text) => (
              <Link
                key={text}
                href="#"
                underline="hover"
                sx={{ color: 'grey.500', '&:hover': { color: 'white' }, fontSize: '0.875rem' }}
              >
                {text}
              </Link>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
