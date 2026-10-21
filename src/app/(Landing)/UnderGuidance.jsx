
const UnderGuidance = ({ mentors }) => {
  return (
    <section
      id="guidance"
      className="bg-gradient-to-br from-[#11111B] via-[#171525] to-[#211A30] py-16 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="mb-14 text-center">
          <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-violet-400 via-purple-400 to-amber-300" />

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Under the Guidance of
          </h2>

          <p className="mx-auto mt-4 max-w-3xl leading-7 text-slate-300">
            Our academy is privileged to be guided by distinguished educators
            whose decades of experience, academic leadership, and dedication to
            quality education continue to inspire our vision and strengthen our
            commitment to student success.
          </p>
        </div>

        {/* Mentor Cards */}
        <div className="grid gap-8 lg:grid-cols-2">
          {mentors.map((mentor, index) => (
            <div
              key={index}
              className="rounded-[30px] border border-white/[0.12] bg-white/[0.055] p-8 shadow-xl shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-violet-300/40 hover:shadow-2xl hover:shadow-violet-950/30"
            >
              {/* Top */}
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <img
                  src={mentor.image}
                  alt={mentor.name}
                  className="h-36 w-36 rounded-full border-4 border-[#29243B] object-cover shadow-xl ring-2 ring-violet-400/30"
                />

                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-2xl font-bold tracking-tight text-white">
                    {mentor.name}
                  </h3>

                  <p className="mt-2 text-slate-300">
                    {mentor.qualification}
                  </p>

                  {/* Designation and Experience */}
                  <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-3 sm:justify-start">
                    <div className="border-l-2 border-violet-400 pl-3">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Designation
                      </p>
                      <p className="mt-1 text-sm font-semibold text-violet-200">
                        {mentor.designation}
                      </p>
                    </div>

                    <div className="border-l-2 border-amber-300/70 pl-3">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Experience
                      </p>
                      <p className="mt-1 text-sm font-semibold text-amber-100">
                        {mentor.experience}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="my-7 h-px w-full bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

              {/* Organization */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Associated With
                </p>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-200">
                  {mentor.organization}
                </p>
              </div>

              {/* Story */}
              <p className="mt-6 leading-8 text-slate-300">
                {mentor.story}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UnderGuidance;
